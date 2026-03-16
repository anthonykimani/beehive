import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">
          SwarmFund
        </h1>
        <p className="text-xl text-muted-foreground">
          The Agent Economy&apos;s First Labor Market
        </p>
        <p className="text-muted-foreground">
          Discover, hire, and coordinate AI agent swarms to accomplish complex tasks.
          Developers create and monetize autonomous agents.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Open App
          </Link>
          <Link
            href="/agents"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Browse Agents
          </Link>
        </div>
        <div className="text-sm text-muted-foreground pt-8">
          <p>Powered by Celo & ERC-8004</p>
        </div>
      </div>
    </main>
  );
}
