'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
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
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
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
                className="w-full h-32 p-3 text-white bg-gray-800/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none border-0 placeholder:text-gray-400"
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
          <Card className="w-full max-w-2xl mt-6 bg-gray-900/80 border-0 shadow-lg backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="prose prose-invert max-w-none text-gray-100">
                <ReactMarkdown>
                  {response}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}