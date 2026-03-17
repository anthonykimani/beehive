'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const MOCK_SWARMS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Data Pipeline Pro',
    description: 'End-to-end data collection and analysis swarm. MarketScout for data gathering, DataAnalyzer for insights, and ReportWriter for deliverables.',
    isPublic: true,
    creatorId: '0x1234567890abcdef',
    agents: [
      { id: '1', name: 'MarketScout Pro', category: 'discovery', role: 'data-collection' },
      { id: '2', name: 'DataAnalyzer AI', category: 'analysis', role: 'analysis' },
      { id: '3', name: 'ReportWriter', category: 'execution', role: 'reporting' },
    ],
    totalTasks: 847,
    rating: 4.8,
    createdAt: '2024-02-01',
  },
  '2': {
    id: '2',
    name: 'Research Assistant',
    description: 'Comprehensive research and summarization swarm.',
    isPublic: true,
    creatorId: '0xabcdef1234567890',
    agents: [
      { id: '1', name: 'MarketScout Pro', category: 'discovery', role: 'research' },
      { id: '3', name: 'ReportWriter', category: 'execution', role: 'summarization' },
    ],
    totalTasks: 523,
    rating: 4.6,
    createdAt: '2024-02-15',
  },
};

export default function SwarmDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [swarm, setSwarm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const swarmId = params.id as string;
    const foundSwarm = MOCK_SWARMS[swarmId];
    setSwarm(foundSwarm || null);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }

  if (!swarm) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Swarm Not Found</h1>
          <button
            onClick={() => router.push('/swarms')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Back to Swarms
          </button>
        </div>
      </div>
    );
  }

  const calculateTotal = () => {
    let total = 0;
    swarm.agents.forEach((agent: any) => {
      const price = agent.category === 'discovery' ? 15 : agent.category === 'analysis' ? 30 : 20;
      total += price;
    });
    return total;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Swarms
        </button>

        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{swarm.name}</h1>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  swarm.isPublic ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {swarm.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <p className="text-muted-foreground">{swarm.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">⭐ {swarm.rating}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{swarm.totalTasks.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{swarm.agents.length}</div>
              <div className="text-sm text-muted-foreground">Agents</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Agent Composition</h3>
            <div className="space-y-3">
              {swarm.agents.map((agent: any, index: number) => (
                <div key={agent.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.category}</div>
                  </div>
                  <div className="text-sm px-3 py-1 bg-secondary rounded-full">
                    {agent.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-secondary rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="font-medium">Estimated Cost</span>
              <span className="text-2xl font-bold">${calculateTotal()}/task</span>
            </div>
          </div>

          <button
            onClick={() => router.push(`/tasks/new?swarm=${swarm.id}`)}
            className="w-full py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Use This Swarm
          </button>
        </div>

        <div className="text-sm text-muted-foreground">
          Created by {swarm.creatorId} on {swarm.createdAt}
        </div>
      </div>
    </div>
  );
}
