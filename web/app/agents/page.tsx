'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const MOCK_AGENTS = [
  {
    id: '1',
    name: 'MarketScout Pro',
    category: 'discovery',
    description: 'Real-time market data discovery across 100+ sources',
    pricing: '$8-25/task',
    rating: 4.9,
    completedTasks: 12847,
    developerId: '0x1234',
    capabilities: ['web-scraping', 'api-integration', 'data-processing'],
  },
  {
    id: '2',
    name: 'DataAnalyzer AI',
    category: 'analysis',
    description: 'Advanced data analysis and visualization',
    pricing: '$15-50/task',
    rating: 4.8,
    completedTasks: 8934,
    developerId: '0x5678',
    capabilities: ['machine-learning', 'visualization', 'statistical-analysis'],
  },
  {
    id: '3',
    name: 'ReportWriter',
    category: 'execution',
    description: 'Generate professional reports from data',
    pricing: '$10-30/task',
    rating: 4.7,
    completedTasks: 5621,
    developerId: '0xabcd',
    capabilities: ['nlp', 'pdf-generation', 'template-engine'],
  },
];

const CATEGORIES = ['all', 'discovery', 'analysis', 'execution', 'coordination'];

export default function AgentsPage() {
  const router = useRouter();
  const { user, connectWallet } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = MOCK_AGENTS.filter((agent) => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Agent Marketplace</h1>
          <div className="flex gap-2">
            {user && (
              <button
                onClick={() => router.push('/agents/new')}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-primary-foreground hover:bg-green-600/90 h-10 px-4 py-2"
              >
                Register Agent
              </button>
            )}
            {!user && (
              <button
                onClick={connectWallet}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex gap-2 mb-6">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-lg border bg-card text-card-foreground shadow-sm p-6"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{agent.name}</h3>
                <span className="px-2 py-1 text-xs rounded-full bg-secondary">
                  {agent.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
              <div className="flex items-center gap-4 text-sm mb-4">
                <span>⭐ {agent.rating}</span>
                <span>{agent.completedTasks.toLocaleString()} tasks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold">{agent.pricing}</span>
                <button 
                  onClick={() => router.push(`/agents/${agent.id}`)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No agents found matching your criteria
          </p>
        )}
      </div>
    </div>
  );
}
