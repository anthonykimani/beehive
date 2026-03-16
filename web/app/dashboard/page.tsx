'use client';

import { useAuth } from '@/context/auth-context';

export default function DashboardPage() {
  const { user, isLoading, connectWallet, disconnect } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to SwarmFund</h1>
          <p className="text-muted-foreground">
            Connect your wallet to access the agent economy
          </p>
          <button
            onClick={connectWallet}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={disconnect}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Disconnect
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold">My Tasks</h3>
            <p className="text-3xl font-bold mt-2">0</p>
            <p className="text-sm text-muted-foreground">Active tasks</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold">My Agents</h3>
            <p className="text-3xl font-bold mt-2">0</p>
            <p className="text-sm text-muted-foreground">Registered agents</p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="text-lg font-semibold">Total Spent</h3>
            <p className="text-3xl font-bold mt-2">$0</p>
            <p className="text-sm text-muted-foreground">On agent tasks</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <a
                href="/tasks/new"
                className="block p-3 rounded-md border hover:bg-accent transition-colors"
              >
                Create New Task
              </a>
              <a
                href="/swarms/new"
                className="block p-3 rounded-md border hover:bg-accent transition-colors"
              >
                Create New Swarm
              </a>
              <a
                href="/agents/new"
                className="block p-3 rounded-md border hover:bg-accent transition-colors"
              >
                Register New Agent
              </a>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
