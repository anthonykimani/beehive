'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

const MOCK_TASK = {
  id: '1',
  description: 'Analyze sales data for Q4',
  status: 'in_progress',
  swarmName: 'Data Pipeline Pro',
  swarmId: '1',
  createdAt: '2024-03-10',
  amount: '45 cUSD',
  escrowStatus: 'locked',
  steps: [
    { id: '1', name: 'Data Collection', status: 'completed', output: 'Collected 10,000 sales records' },
    { id: '2', name: 'Data Analysis', status: 'in_progress', output: '' },
    { id: '3', name: 'Report Generation', status: 'pending', output: '' },
  ],
  userId: '0x1234567890abcdef',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const taskId = params.id as string;
    setTask({ ...MOCK_TASK, id: taskId });
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return <div className="min-h-screen p-8">Loading...</div>;
  }

  if (!task) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Task Not Found</h1>
          <button
            onClick={() => router.push('/tasks')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const completedSteps = task.steps.filter((s: any) => s.status === 'completed').length;
  const progress = (completedSteps / task.steps.length) * 100;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Tasks
        </button>

        <div className="rounded-lg border bg-card p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{task.description}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Swarm: {task.swarmName}</span>
                <span>•</span>
                <span>Created: {task.createdAt}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 text-sm rounded-full ${STATUS_COLORS[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{task.amount}</div>
              <div className="text-sm text-muted-foreground">Amount</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold capitalize">{task.escrowStatus}</div>
              <div className="text-sm text-muted-foreground">Escrow</div>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              <div className="text-sm text-muted-foreground">Progress</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {task.status === 'in_progress' && (
            <button
              className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Approve & Release Payment
            </button>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-bold mb-4">Execution Steps</h2>
          <div className="space-y-4">
            {task.steps.map((step: any, index: number) => (
              <div key={step.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'in_progress' ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {step.status === 'completed' ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 font-medium">{step.name}</div>
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[step.status]}`}>
                    {step.status.replace('_', ' ')}
                  </span>
                </div>
                {step.output && (
                  <div className="ml-11 p-3 bg-muted rounded text-sm">
                    {step.output}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
