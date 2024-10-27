'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'

type Citation = {
  url: string;
  title: string;
};

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(false);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(''); // Clear previous response
    setCitations([]); // Clear previous citations
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      setResponse(data.response);
      if (data.citations) {
        setCitations(data.citations);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
  };

  const formatMarkdown = (text: string) => {
    // Clean up reference formatting and ensure proper wrapping
    return text.replace(
      /-:\s*(https?:\/\/[^\s]+)/g, 
      '* [$1]($1)'
    );
  };

  return (
    <main className="min-h-screen relative bg-black">
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
        onError={handleVideoError}
        onLoadedData={handleVideoLoad}
      >
        <source src="/eagle.mp4" type="video/mp4" />
        Video not supported
      </video>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <h1 
          className="text-6xl font-bold mb-8 tracking-wide"
          style={{
            color: 'rgba(50, 50, 50, 0.9)',
            textShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}
        >
          Eagle Eye
        </h1>

        <Card className="w-full max-w-2xl bg-gray-900/80 border-0 shadow-lg backdrop-blur-sm">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Analyze target companies, market trends, or deal metrics..."
                className="w-full h-32 p-3 text-white bg-gray-800/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-0 placeholder:text-gray-400 resize-none"
                style={{minHeight: '8rem', height: 'auto'}}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <Button 
                type="submit" 
                className="w-full bg-blue-600/90 hover:bg-blue-700/90 transition-colors text-gray-100"
                disabled={loading || !query.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {response && (
          <Card className="w-full max-w-2xl mt-6 mb-6 bg-gray-900/80 border-0 shadow-lg backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="prose prose-invert max-w-none text-gray-100">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-4 break-words">{children}</p>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 break-words">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-3 break-words">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mb-2 break-words">{children}</h3>,
                    ul: ({ children }) => <ul className="mb-4 list-disc pl-6 space-y-2">{children}</ul>,
                    li: ({ children }) => <li className="mb-1 break-words">{children}</li>,
                    a: ({ children, href }) => (
                      <a 
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 no-underline break-words"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                  {formatMarkdown(response)}
                </ReactMarkdown>

                {citations.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-700">
                    <h3 className="text-lg font-semibold mb-2">Sources:</h3>
                    <ul className="list-none space-y-2">
                      {citations.map((citation, index) => (
                        <li key={index} className="break-words">
                          <a 
                            href={citation.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 no-underline"
                          >
                            {citation.title || citation.url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}