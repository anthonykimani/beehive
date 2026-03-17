'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const AVAILABLE_AGENTS = [
  { id: '1', name: 'MarketScout Pro', category: 'discovery', pricing: '$8-25/task' },
  { id: '2', name: 'DataAnalyzer AI', category: 'analysis', pricing: '$15-50/task' },
  { id: '3', name: 'ReportWriter', category: 'execution', pricing: '$10-30/task' },
];

export default function NewSwarmPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    agents: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet Required</h1>
          <p className="text-muted-foreground">Please connect your wallet to create a swarm.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/swarms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/swarms/${data.data.id}`);
      } else {
        alert('Failed to create swarm');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating swarm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setFormData(prev => ({
      ...prev,
      agents: prev.agents.includes(agentId)
        ? prev.agents.filter(id => id !== agentId)
        : [...prev.agents, agentId]
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    formData.agents.forEach(agentId => {
      const agent = AVAILABLE_AGENTS.find(a => a.id === agentId);
      if (agent) {
        const price = parseInt(agent.pricing.replace('$', '').replace('/task', ''));
        total += price;
      }
    });
    return total;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Swarm</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Swarm Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., Research Pipeline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md h-32"
              placeholder="Describe what this swarm does..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isPublic" className="text-sm font-medium">
              Make this swarm public (visible in marketplace)
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Agents ({formData.agents.length} selected)
            </label>
            <div className="grid gap-3">
              {AVAILABLE_AGENTS.map((agent) => (
                <div
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.agents.includes(agent.id)
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.category} • {agent.pricing}
                      </div>
                    </div>
                    {formData.agents.includes(agent.id) && (
                      <span className="text-primary">✓ Selected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {formData.agents.length > 0 && (
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Total</span>
                <span className="text-2xl font-bold">${calculateTotal()}/task</span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || formData.agents.length === 0}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Swarm'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border rounded-md hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
