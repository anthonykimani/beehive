'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const AVAILABLE_SWARMS = [
  { id: '1', name: 'Data Pipeline Pro', description: 'Data collection and analysis', price: '$45/task' },
  { id: '2', name: 'Research Assistant', description: 'Research and summarization', price: '$25/task' },
];

const AVAILABLE_AGENTS = [
  { id: '1', name: 'MarketScout Pro', category: 'discovery', price: '$15/task' },
  { id: '2', name: 'DataAnalyzer AI', category: 'analysis', price: '$30/task' },
  { id: '3', name: 'ReportWriter', category: 'execution', price: '$20/task' },
];

export default function NewTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    description: '',
    swarmId: searchParams.get('swarm') || '',
    agentId: searchParams.get('agent') || '',
    parameters: {} as Record<string, string>,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet Required</h1>
          <p className="text-muted-foreground">Please connect your wallet to create a task.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: formData.description,
          swarmId: formData.swarmId || undefined,
          parameters: formData.parameters,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/tasks/${data.data.id}`);
      } else {
        alert('Failed to create task');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEstimatedCost = () => {
    if (formData.swarmId) {
      const swarm = AVAILABLE_SWARMS.find(s => s.id === formData.swarmId);
      return swarm?.price || '';
    }
    if (formData.agentId) {
      const agent = AVAILABLE_AGENTS.find(a => a.id === formData.agentId);
      return agent?.price || '';
    }
    return '';
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Task</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Task Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md h-32"
              placeholder="Describe what you want the agent(s) to do..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Swarm (optional)</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="target"
                  checked={!formData.swarmId && !formData.agentId}
                  onChange={() => setFormData({ ...formData, swarmId: '', agentId: '' })}
                />
                <span className="text-sm">Single agent</span>
              </label>
              {AVAILABLE_SWARMS.map((swarm) => (
                <div
                  key={swarm.id}
                  onClick={() => setFormData({ ...formData, swarmId: swarm.id, agentId: '' })}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.swarmId === swarm.id
                      ? 'border-primary bg-primary/10'
                      : 'hover:border-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{swarm.name}</div>
                      <div className="text-sm text-muted-foreground">{swarm.description}</div>
                    </div>
                    <div className="font-medium">{swarm.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!formData.swarmId && (
            <div>
              <label className="block text-sm font-medium mb-2">Or Select Single Agent</label>
              <div className="grid gap-2">
                {AVAILABLE_AGENTS.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => setFormData({ ...formData, agentId: agent.id })}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.agentId === agent.id
                        ? 'border-primary bg-primary/10'
                        : 'hover:border-gray-400'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">{agent.category}</div>
                      </div>
                      <div className="font-medium">{agent.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {getEstimatedCost() && (
            <div className="p-4 bg-secondary rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Estimated Cost</span>
                <span className="text-2xl font-bold">{getEstimatedCost()}</span>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting || (!formData.swarmId && !formData.agentId)}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
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
