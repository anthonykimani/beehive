# SwarmFund Backend Tech Spec

## Purpose

This document defines the target backend architecture for SwarmFund as a full custom backend using Express, TypeScript, TypeORM, PostgreSQL, and Socket.IO. It is based on:

- product requirements in `docs/prd.md`
- the service-oriented Express + TypeORM structure patterns
- the Socket.IO server pattern for realtime agent coordination
- Celo blockchain integration for payments and ERC-8004 registry

The backend must support the three-sided marketplace model: users who hire agent swarms, developers who create and monetize agents, and the protocol that coordinates economic interactions.

## Core Architecture Principles

- Express + TypeScript monolith first, with clear module boundaries
- PostgreSQL as the source of truth for all business data
- TypeORM entities + repositories for persistence access
- controllers -> services -> repositories layering
- wallet-aware auth and payments handled in the API
- asynchronous workers for jobs that should not block request/response
- all business rules enforced server-side
- API designed for web and mobile clients first

## Runtime Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- TypeORM
- Redis + BullMQ for background jobs
- Zod for request validation
- JWT for API auth session tokens
- Celo wallet verification utilities
- Socket.IO for realtime agent coordination and task updates
- Thirdweb x402 for payment streams
- The Graph for on-chain reputation queries

## Proposed Folder Structure

```text
service/
  index.ts
  app.ts
  configs/
    env.config.ts
    orm.config.ts
    cors.config.ts
    queue.config.ts
    socket.config.ts
  controllers/
    auth.controller.ts
    agent.controller.ts
    swarm.controller.ts
    task.controller.ts
    payment.controller.ts
    reputation.controller.ts
    admin.controller.ts
  routes/
    index.auth.ts
    index.agent.ts
    index.swarm.ts
    index.task.ts
    index.payment.ts
    index.reputation.ts
    index.admin.ts
  services/
    auth.service.ts
    agent.service.ts
    swarm.service.ts
    task.service.ts
    payment.service.ts
    reputation.service.ts
    realtime.service.ts
    escrow.service.ts
    moderation.service.ts
    analytics.service.ts
  repositories/
    user.repo.ts
    agent.repo.ts
    swarm.repo.ts
    task.repo.ts
    payment-transaction.repo.ts
    reputation.repo.ts
    dispute.repo.ts
  models/
    user.entity.ts
    agent.entity.ts
    swarm.entity.ts
    task.entity.ts
    payment-transaction.entity.ts
    reputation.entity.ts
    dispute.entity.ts
  middleware/
    auth.ts
    wallet-auth.ts
    request-context.ts
    validate.ts
    error-handler.ts
    rate-limit.ts
  validators/
    auth.validator.ts
    agent.validator.ts
    swarm.validator.ts
    task.validator.ts
    payment.validator.ts
  jobs/
    worker.ts
    processors/
      payment-confirmation.processor.ts
      task-execution.processor.ts
      reputation-update.processor.ts
      escrow-release.processor.ts
  interfaces/
  utils/
    socket/
      app.socket.manager.ts
    blockchain/
      celo.utils.ts
      erc8004.utils.ts
      x402.utils.ts
  migrations/
  seeds/
```

## Domain Model

## 1. Users

Represents platform users who hire agent swarms.

Fields:

- `id`
- `walletAddress` (unique)
- `username` (unique)
- `displayName`
- `email` nullable
- `avatarUrl`
- `role` (user, developer, admin)
- `isVerified`
- `isBanned`
- `createdAt`, `updatedAt`

## 2. Agents

Registered AI agents on the platform.

Fields:

- `id`
- `developerId` (FK to User)
- `name`
- `description`
- `category` (discovery, analysis, execution, coordination, etc.)
- `capabilities` jsonb
- `pricingModel` (perTask, perHour, subscription)
- `basePrice` (in cUSD)
- `stakeAmount` (CELO staked for reputation)
- `isVerified`
- `isActive`
- `totalTasksCompleted`
- `averageRating`
- `createdAt`, `updatedAt`

## 3. Swarms

Pre-composed or dynamically formed agent groups.

Fields:

- `id`
- `name`
- `description`
- `creatorId` (FK to User)
- `isPublic` (true for marketplace, false for custom)
- `agents` jsonb (array of agent IDs with roles)
- `totalTasksCompleted`
- `averageRating`
- `createdAt`, `updatedAt`

## 4. Tasks

User requests for agent services.

Fields:

- `id`
- `userId` (FK to User)
- `swarmId` (FK to Swarm, nullable for dynamic)
- `description`
- `parameters` jsonb
- `status` (pending, in_progress, completed, disputed, cancelled)
- `escrowAmount`
- `escrowStatus` (locked, releasing, released)
- `startedAt`
- `completedAt`
- `createdAt`, `updatedAt`

## 5. TaskSteps

Individual agent execution steps within a task.

Fields:

- `id`
- `taskId` (FK to Task)
- `agentId` (FK to Agent)
- `status` (queued, in_progress, completed, failed)
- `input` jsonb
- `output` jsonb
- `startedAt`
- `completedAt`

## 6. Payments

Transaction ledger for all platform payments.

Fields:

- `id`
- `taskId` (FK to Task, nullable)
- `fromUserId` (FK to User)
- `toAgentId` (FK to Agent, nullable for platform fees)
- `type` (task_payment, refund, stake, slash, platform_fee)
- `status` (pending, confirmed, failed)
- `assetSymbol` (cUSD, CELO)
- `assetAmount`
- `usdAmount`
- `txHash` nullable
- `reference`
- `metadata` jsonb
- `createdAt`, `confirmedAt`

## 7. Reputation

On-chain and off-chain reputation data.

Fields:

- `id`
- `agentId` (FK to Agent)
- `onChainScore` (from ERC-8004)
- `offChainScore` (computed from reviews)
- `totalReviews`
- `averageRating`
- `stakeAmount`
- `lastUpdated`

## 8. Disputes

Task dispute records.

Fields:

- `id`
- `taskId` (FK to Task)
- `raisedByUserId` (FK to User)
- `reason`
- `status` (open, resolved, escalated)
- `resolution`
- `slashedAmount`
- `createdAt`, `resolvedAt`

## API Surface

Base prefix:

`/api/v1`

### Auth

- `POST /auth/wallet/nonce`
- `POST /auth/wallet/verify`
- `POST /auth/refresh`
- `GET /auth/me`

### Agents

- `GET /agents` - List marketplace agents
- `GET /agents/:agentId` - Agent details
- `POST /agents` - Register new agent (developer)
- `PATCH /agents/:agentId` - Update agent
- `DELETE /agents/:agentId` - Deactivate agent

### Swarms

- `GET /swarms` - List marketplace swarms
- `GET /swarms/:swarmId` - Swarm details
- `POST /swarms` - Create custom swarm
- `PATCH /swarms/:swarmId` - Update swarm
- `DELETE /swarms/:swarmId` - Delete swarm

### Tasks

- `GET /tasks` - User's tasks
- `GET /tasks/:taskId` - Task details
- `POST /tasks` - Create new task
- `POST /tasks/:taskId/cancel` - Cancel task
- `POST /tasks/:taskId/dispute` - Raise dispute
- `GET /tasks/:taskId/steps` - Task execution steps

### Payments

- `POST /payments/escrow/lock` - Lock funds to escrow
- `POST /payments/escrow/release` - Release to agents
- `POST /payments/escrow/refund` - Refund to user
- `GET /payments/history` - Payment history
- `POST /payments/stake` - Stake CELO for agent
- `POST /payments/unstake` - Unstake CELO

### Reputation

- `GET /reputation/:agentId` - Get agent reputation
- `POST /reviews` - Submit review after task

### Admin

- `GET /admin/agents` - List all agents
- `PATCH /admin/agents/:agentId/verify`
- `GET /admin/tasks` - List all tasks
- `GET /admin/disputes` - List disputes
- `POST /admin/disputes/:disputeId/resolve`
- `GET /admin/metrics` - Platform metrics

### Health

- `GET /health`
- `GET /ready`

## Auth Model

The backend owns authentication and session issuance.

Flow:

1. Frontend requests a wallet nonce from the backend.
2. User signs the nonce using their Celo wallet (e.g., Valora, MetaMask).
3. Backend verifies the signature against the submitted wallet address.
4. Backend upserts the local `user` account by wallet address.
5. Backend issues its own signed JWT access token.
6. Frontend uses Bearer auth for all API requests.

### Wallet connection flow

- `POST /auth/wallet/nonce` returns a short-lived message for the active wallet address
- `POST /auth/wallet/verify` accepts `address` + `signature`
- verified sessions return:
  - backend JWT
  - local user record
  - wallet metadata
  - next-step indicator for onboarding

Expected backend responsibilities:

- normalize wallet address casing
- bind nonces to address + expiry + one-time use
- reject replayed signatures
- store wallet connection metadata on the user account
- support Celo as the primary auth channel

## Agent Discovery and Swarm Formation

The agent matching model should start simple but production-oriented.

### Discovery inputs

- category compatibility
- capability matching
- reputation score weighting
- price range compatibility
- stake amount (higher = more trustworthy)
- availability status

### Swarm composition

- User describes task in natural language
- Platform analyzes request
- Suggests agent swarm composition
- User can modify suggested composition
- Agents can be pre-composed (public swarms) or dynamic

### Task execution flow

1. User creates task with description and escrow
2. Platform matches task to swarm
3. Agents execute in sequence/parallel based on swarm config
4. Each step updates status in real-time
5. On completion, user approves or disputes
6. Payment released to agents (minus platform fee)

## Realtime / WebSocket Architecture

Socket.IO for realtime agent coordination and task updates.

### Server pattern

- create the Express app
- create the Node HTTP server
- initialize Socket.IO with that server
- export the shared `io` instance and socket manager

### Socket manager responsibilities

- authenticate socket connections using backend JWT
- map each socket to `userId`
- join user-scoped rooms such as:
  - `user:{userId}`
  - `task:{taskId}`
  - `agent:{agentId}`
- register and handle socket events
- emit domain events after service-layer mutations complete

### Initial websocket events

Client -> server:

- `connection`
- `join-task`
- `leave-task`
- `agent-heartbeat`
- `task-update`

Server -> client:

- `task-created`
- `task-status-changed`
- `step-started`
- `step-completed`
- `step-failed`
- `payment-received`
- `dispute-opened`
- `error`

### Realtime rules

- websocket events never bypass service authorization
- HTTP remains the source of truth for writes
- sockets are used for delivery, status updates, and synchronization
- if sockets fail, the client polls REST endpoint for status

## Payment Integration

### x402 Payment Flow

The platform uses Thirdweb x402 for payment streams between users, agents, and sub-agents.

Recommended modules:

- `payment.service.ts` for transaction orchestration
- `x402-payment.provider.ts` for x402-specific verification/submission helpers
- `escrow.service.ts` for locked funds management

### Escrow Model

1. User creates task, locks funds in escrow
2. Agents execute task steps
3. On completion, user approves → funds released to agents
4. On dispute → funds held until resolution

### Revenue Split

```
User pays $100 for task
  → Platform fee: 5% ($5)
  → Agent A (Scout): 30% ($28.50)
  → Agent B (Analyst): 45% ($42.75)
  → Agent C (Execution): 20% ($19.00)
```

## Queue / Worker Responsibilities

Use Redis-backed workers for tasks that should be reliable and replayable.

Jobs:

- payment confirmation polling / reconciliation
- task step execution timeout
- reputation score updates
- analytics rollups
- notification fanout

## Validation and Error Handling

- Zod schemas per route
- centralized validation middleware
- centralized API error envelope
- distinguish business errors from system errors
- structured logs with request IDs

Standard response envelope:

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": {}
}
```

## Security Requirements

- JWT signing secret rotation support
- rate limiting on auth, task creation, and payments
- strict ownership checks in every write path
- server-side permission checks for developer-only agent registration
- escrow validation before payment release
- webhook/payment signature verification
- audit trail for moderation and payment state transitions

## Observability

- health endpoint
- readiness checks for Postgres + Redis
- structured logs
- job dashboard for queues
- metrics for tasks, payments, active agents, platform volume

## Testing Strategy

- unit tests for services
- integration tests for controllers + database flows
- repository tests for query correctness
- payment confirmation and reconciliation tests
- seed data for local QA and staging

## Recommended Phase 1 Backend Scope

Must ship:

- Wallet auth
- Agent CRUD
- Swarm management
- Task creation and execution
- Escrow payments
- Basic reputation
- Agent verification (admin)
- Platform metrics

Can wait:

- Advanced dispute resolution
- Advanced reputation algorithms
- Full notifications stack
- Video/voice capabilities

## Final Recommendation

SwarmFund should be implemented as a structured Express + TypeScript + TypeORM monolith with PostgreSQL as the single source of truth and Redis-backed workers for payment and task execution jobs. The backend should have clean modular service boundaries, preserve the three-sided marketplace model (users, developers, protocol), and move all security, monetization, and agent coordination rules into first-party backend services.
