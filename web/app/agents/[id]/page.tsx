'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const MOCK_AGENTS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'MarketScout Pro',
    category: 'discovery',
    description: 'Real-time market data discovery across 100+ sources. Scraper, API integrator, and data processor all in one powerful agent.',
    pricing: '$8-25/task',
    rating: 4.9,
    completedTasks: 12847,
    developerId: '0x1234567890abcdef',
    capabilities: ['web-scraping', 'api-integration', 'data-processing'],
    isVerified: true,
    createdAt: '2024-01-15',
  },
  '2': {
    id: '2',
    name: 'DataAnalyzer AI',
    category: 'analysis',
    description: 'Advanced data analysis and visualization. Machine learning models, statistical analysis, and beautiful charts.',
    pricing: '$15-50/task',
    rating: 4.8,
    completedTasks: 8934,
    developerId: '0xabcdef1234567890',
    capabilities: ['machine-learning', 'visualization', 'statistical-analysis'],
    isVerified: true,
    createdAt: '2024-02-20',
  },
  '3': {
    id: '3',
    name: 'ReportWriter',
    category: 'execution',
    description: 'Generate professional reports from data. NLP-powered summarization, PDF generation, and custom templates.',
    pricing: '$10-30/task',
    rating: 4.7,
    completedTasks: 5621,
    developerId: '0x9876543210fedcba',
    capabilities: ['nlp', 'pdf-generation', 'template-engine'],
    isVerified: false,
    createdAt: '2024-03-10',
  },
};

const REVIEWS = [
  { id: '1', user: '0x...abc', rating: 5, comment: 'Excellent agent! Very fast and accurate.', date: '2024-03-01' },
  { id: '2', user: '0x...def', rating: 5, comment: 'Great for data collection. Highly recommended!', date: '2024-02-28' },
  { id: '3', user: '0x...ghi', rating: 4, comment: 'Works well, occasional timeout but overall good.', date: '2024-02-15' },
];

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const agentId = params.id as string;
    const foundAgent = MOCK_AGENTS[agentId];
    setAgent(foundAgent || null);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }

  if (!agent) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <button
            onClick={() => router.push('/agents')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Marketplace
        </button>

        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{agent.name}</h1>
                {agent.isVerified && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <span className="px-3 py-1 text-sm bg-secondary rounded-full">
                {agent.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{agent.pricing}</div>
              <div className="text-sm text-muted-foreground">per task</div>
            </div>
          </div>

          <p className="text-lg mb-6">{agent.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">⭐ {agent.rating}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{agent.completedTasks.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{agent.capabilities.length}</div>
              <div className="text-sm text-muted-foreground">Capabilities</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.map((cap: string) => (
                <span key={cap} className="px-3 py-1 text-sm bg-background border rounded-md">
                  {cap}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Developer</h3>
            <div className="text-sm text-muted-foreground font-mono">
              {agent.developerId}
            </div>
          </div>

          <button
            onClick={() => router.push(`/tasks/new?agent=${agent.id}`)}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Hire This Agent
          </button>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          <div className="space-y-4">
            {REVIEWS.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-sm">{review.user}</div>
                  <div className="text-sm text-muted-foreground">{review.date}</div>
                </div>
                <div className="mb-1">{'⭐'.repeat(review.rating)}</div>
                <p className="text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
