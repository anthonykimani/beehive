import { config } from 'dotenv';

config();

export const env = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    name: process.env.DATABASE_NAME || 'swarmfund',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  
  celo: {
    rpcUrl: process.env.CELO_RPC_URL || 'https://alfajores-forno.celo-testnet.org',
    agentRegistryAddress: process.env.AGENT_REGISTRY_ADDRESS || '',
  },
  
  x402: {
    facilitatorUrl: process.env.X402_FACILITATOR_URL || '',
    facilitatorApiKey: process.env.X402_FACILITATOR_API_KEY || '',
  },
  
  posthog: {
    apiKey: process.env.POSTHOG_API_KEY || '',
    host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
  },
};
