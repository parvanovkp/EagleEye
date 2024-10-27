// app/api/analyze/route.ts

import { NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        
        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        console.log('Making request to Perplexity API...');
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
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
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Perplexity API error:', errorText);
            return NextResponse.json(
                { error: 'API request failed' },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        return NextResponse.json({
            response: data.choices[0].message.content
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}