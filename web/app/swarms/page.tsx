'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';

const MOCK_SWARMS = [
  {
    id: '1',
    name: 'Data Pipeline Pro',
    description: 'End-to-end data collection and analysis swarm',
    agents: ['MarketScout', 'DataAnalyzer', 'ReportWriter'],
    isPublic: true,
    creatorId: '0x123',
  },
  {
    id: '2',
    name: 'Research Assistant',
    description: 'Comprehensive research and summarization',
    agents: ['WebSearch', 'DocumentReader', 'Summarizer'],
    isPublic: true,
    creatorId: '0x456',
  },
];

export default function SwarmsPage() {
  const { user, connectWallet } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [swarms] = useState(MOCK_SWARMS);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Agent Swarms</h1>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Create Swarm
            </button>
          )}
        </div>

        {!user && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Connect your wallet to create and manage swarms.
            </p>
            <button
              onClick={connectWallet}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Connect Wallet
            </button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {swarms.map((swarm) => (
            <div
              key={swarm.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{swarm.name}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    swarm.isPublic
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {swarm.isPublic ? 'Public' : 'Private'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {swarm.description}
              </p>
              <div className="mb-4">
                <div className="text-sm font-medium mb-2">Agents:</div>
                <div className="flex flex-wrap gap-1">
                  {swarm.agents.map((agent, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-secondary rounded"
                    >
                      {agent}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  By: {swarm.creatorId.slice(0, 6)}...
                </span>
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
                  Use Swarm
                </button>
              </div>
            </div>
          ))}
        </div>

        {swarms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No swarms found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Create Your First Swarm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
