'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const MOCK_TASKS = [
  {
    id: '1',
    description: 'Analyze sales data for Q4',
    status: 'completed',
    swarmName: 'Data Pipeline Pro',
    createdAt: '2024-03-10',
    amount: '45 cUSD',
  },
  {
    id: '2',
    description: 'Research competitor pricing',
    status: 'in_progress',
    swarmName: 'Research Assistant',
    createdAt: '2024-03-12',
    amount: '25 cUSD',
  },
  {
    id: '3',
    description: 'Generate monthly report',
    status: 'pending',
    swarmName: 'Data Pipeline Pro',
    createdAt: '2024-03-13',
    amount: '30 cUSD',
  },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  disputed: 'bg-purple-100 text-purple-800',
};

export default function TasksPage() {
  const router = useRouter();
  const { user, connectWallet } = useAuth();
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filter, setFilter] = useState('all');

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet Required</h1>
          <button
            onClick={connectWallet}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <button
            onClick={() => router.push('/tasks/new')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Create Task
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-5 p-4 font-semibold border-b bg-muted/50">
            <div>Task</div>
            <div>Swarm</div>
            <div>Status</div>
            <div>Amount</div>
            <div>Created</div>
          </div>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-5 p-4 border-b last:border-0 hover:bg-muted/30 cursor-pointer"
              onClick={() => router.push(`/tasks/${task.id}`)}
            >
              <div className="font-medium truncate pr-4">{task.description}</div>
              <div className="text-muted-foreground">{task.swarmName}</div>
              <div>
                <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[task.status]}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
              <div className="font-medium">{task.amount}</div>
              <div className="text-muted-foreground text-sm">{task.createdAt}</div>
            </div>
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No tasks found
          </div>
        )}
      </div>
    </div>
  );
}
