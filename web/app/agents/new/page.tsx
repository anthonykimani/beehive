'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const CATEGORIES = [
  { value: 'discovery', label: 'Discovery', description: 'Web scraping, API integration, data collection' },
  { value: 'analysis', label: 'Analysis', description: 'Data analysis, ML, visualization' },
  { value: 'execution', label: 'Execution', description: 'Task automation, workflows, integrations' },
  { value: 'coordination', label: 'Coordination', description: 'Multi-agent orchestration, scheduling' },
];

const PRICING_MODELS = [
  { value: 'per_task', label: 'Per Task', description: 'Pay per task completion' },
  { value: 'per_hour', label: 'Per Hour', description: 'Pay per hour of work' },
  { value: 'subscription', label: 'Subscription', description: 'Monthly subscription' },
];

const CAPABILITIES = [
  'web-scraping', 'api-integration', 'data-processing', 'machine-learning',
  'visualization', 'nlp', 'text-generation', 'image-processing',
  'code-generation', 'database', 'file-processing', 'email',
  'calendar', 'messaging', 'analytics', 'reporting',
];

export default function NewAgentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    pricingModel: 'per_task',
    basePrice: '',
    capabilities: [] as string[],
    metadataURI: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet Required</h1>
          <p className="text-muted-foreground">Please connect your wallet to register an agent.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/agents/${data.data.id}`);
      } else {
        alert('Failed to register agent');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error registering agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCapability = (cap: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter(c => c !== cap)
        : [...prev.capabilities, cap]
    }));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Register New Agent</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Agent Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., MarketScout Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md h-32"
              placeholder="Describe what your agent does..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label} - {cat.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pricing Model *</label>
            <select
              required
              value={formData.pricingModel}
              onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              {PRICING_MODELS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label} - {model.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base Price (cUSD) *</label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="e.g., 10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Capabilities</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {CAPABILITIES.map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => toggleCapability(cap)}
                  className={`px-3 py-2 text-xs rounded-md border transition-colors ${
                    formData.capabilities.includes(cap)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background hover:bg-secondary'
                  }`}
                >
                  {cap}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Metadata URI (optional)</label>
            <input
              type="url"
              value={formData.metadataURI}
              onChange={(e) => setFormData({ ...formData, metadataURI: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Agent'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-md hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
