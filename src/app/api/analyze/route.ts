// app/api/analyze/route.ts

import { NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export const maxDuration = 60; // Set max duration to 60 seconds

// Timeout wrapper
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 55000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        
        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        console.log('Making request to Perplexity API...');
        const response = await fetchWithTimeout('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-sonar-huge-128k-online",
                messages: [
                    {
                        role: 'system',
                        content: 'You are a private equity financial analyst. Be as thorough in your search as possible. Always include source URLs in your response!'
                    },
                    {
                        role: 'user',
                        content: query
                    }
                ],
                temperature: 0.1,
                top_p: 0.7,
                frequency_penalty: 1.2
            })
        }, 55000); // Set to 55s to ensure we're within the 60s maxDuration

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API error:', errorText);
            return NextResponse.json(
                { error: 'API request failed', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            console.error('Unexpected API response structure:', data);
            return NextResponse.json(
                { error: 'Invalid API response format' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            response: data.choices[0].message.content
        });

    } catch (error) {
        console.error('API Error:', error);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return NextResponse.json(
                    { error: 'Request timed out. Please try a shorter query or try again.' },
                    { status: 408 }
                );
            }
            return NextResponse.json(
                { error: `Request failed: ${error.message}` },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}