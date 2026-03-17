'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

interface DashboardStats {
  totalUsers: number;
  totalAgents: number;
  totalTasks: number;
  totalSwarm: number;
  totalVolume: string;
}

interface PendingAgent {
  id: string;
  name: string;
  developerId: string;
  category: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAgents: 0,
    totalTasks: 0,
    totalSwarm: 0,
    totalVolume: '0',
  });
  const [pendingAgents, setPendingAgents] = useState<PendingAgent[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    const fetchData = async () => {
      try {
        const response = await fetch('/api/v1/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="flex gap-2 mb-6">
          {['overview', 'agents', 'users', 'tasks', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Users</div>
              <div className="text-3xl font-bold mt-2">{stats.totalUsers}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Agents</div>
              <div className="text-3xl font-bold mt-2">{stats.totalAgents}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Tasks</div>
              <div className="text-3xl font-bold mt-2">{stats.totalTasks}</div>
            </div>
            <div className="rounded-lg border bg-card p-6">
              <div className="text-sm font-medium text-muted-foreground">Total Volume</div>
              <div className="text-3xl font-bold mt-2">{stats.totalVolume} cUSD</div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Pending Agent Verifications</h2>
            </div>
            <div className="divide-y">
              {pendingAgents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No pending verifications
                </div>
              ) : (
                pendingAgents.map((agent) => (
                  <div key={agent.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {agent.category} - {agent.developerId}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">User Management</h2>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              User management features coming soon
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Task Management</h2>
            </div>
            <div className="p-8 text-center text-muted-foreground">
              Task management features coming soon
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Platform Settings</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Platform Fee (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  defaultValue={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Minimum Stake (cUSD)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-md"
                  defaultValue={100}
                />
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
