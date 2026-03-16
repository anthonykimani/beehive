# SwarmFund Linear Issues

> All issues follow specifications from: `backend-tech-spec.md`, `frontend-tech-spec.md`, `smart-contracts.md`, `development-cycle.md`

---

## Phase 0: Project Foundation + Analytics

### BZ-001: Set up backend project scaffold (Express + TypeScript)

**Description:** Initialize Express + TypeScript backend project. Set up folder structure as per `backend-tech-spec.md` section "Proposed Folder Structure".

**Reference:** `backend-tech-spec.md` lines 20-40
- Root directory: `service/`
- Modules: configs, controllers, routes, services, repositories, models, middleware, validators, jobs, interfaces, utils

**Reference:** `backend-tech-spec.md` lines 12-19 (Runtime Stack)
- Node.js, Express, TypeScript, PostgreSQL, TypeORM, Redis+BullMQ, Zod, JWT, Socket.IO

**Deliverables:**
- [x] `service/index.ts` - Main entry point with Express app, HTTP server, health endpoint
- [x] `service/configs/` - env.config.ts, orm.config.ts, cors.config.ts
- [x] `package.json` with scripts: `dev`, `build`, `start`
- [x] `tsconfig.json` - TypeScript config
- [x] `.env.example` - Environment variables template

**Test Criteria:**
- [x] Backend boots with `pnpm dev`
- [x] `GET /health` returns 200
- [x] TypeScript compiles without errors

---

### BZ-002: Set up frontend project scaffold (Next.js + TypeScript)

**Description:** Initialize Next.js frontend. Set up folder structure as per `frontend-tech-spec.md`.

**Reference:** `frontend-tech-spec.md` lines 40-55 (Recommended Stack)
- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, React Query, PostHog, Zod

**Deliverables:**
- [x] Next.js 14+ with App Router
- [x] Tailwind CSS configured
- [x] shadcn/ui component system initialized
- [x] `app/layout.tsx` with providers
- [x] `components/ui/` - Base components
- [x] `provider/` - query-provider.tsx, auth-provider.tsx, theme-provider.tsx
- [x] `lib/api/` - API client setup

**Test Criteria:**
- [x] Frontend boots with `pnpm dev`
- [x] Home page renders at `http://localhost:3000`
- [x] TypeScript compiles without errors

---

### BZ-003: Configure Postgres database with TypeORM

**Description:** Set up PostgreSQL with TypeORM configuration. Define entities as per `backend-tech-spec.md` section "Domain Model".

**Reference:** `backend-tech-spec.md` lines 60-130 (Domain Model)
- User, Agent, Swarm, Task, TaskStep, Payments, Reputation, Disputes

**Deliverables:**
- [x] `service/configs/orm.config.ts` - TypeORM DataSource configuration
- [x] `service/models/` - Entity classes with TypeORM decorators
- [x] Database connection established on app start

**Test Criteria:**
- [x] Database connects successfully on startup
- [x] Entities are recognized by TypeORM

---

### BZ-004: Set up auth shell (JWT middleware)

**Description:** Create JWT authentication middleware. Follow auth model from `backend-tech-spec.md`.

**Reference:** `backend-tech-spec.md` lines 145-165
- Backend owns authentication and session issuance
- JWT for API auth session tokens
- Auth middleware attaches `userId`, `walletAddress` to `req`

**Deliverables:**
- [x] `service/middleware/auth.ts` - JWT verification middleware
- [x] `service/configs/env.config.ts` - JWT_SECRET management
- [x] Request context helper to access user from req

**Test Criteria:**
- [x] Middleware verifies JWT tokens
- [x] Unauthenticated requests are rejected (except public routes)

---

### BZ-005: Build component system shell (shadcn/ui)

**Description:** Initialize shadcn/ui component system.

**Reference:** `frontend-tech-spec.md` lines 57-75 (Design System Direction)
- Design tokens: `--background`, `--foreground`, `--card`, `--primary`, etc.
- Visual style: clean surfaces, rounded corners

**Deliverables:**
- [x] `components.json` configuration
- [x] `globals.css` with design tokens
- [x] `components/ui/` - Core components (Button, Input, Card, Avatar, Badge, Label)

**Test Criteria:**
- [x] Components render correctly
- [x] Design tokens apply consistently

---

### BZ-006: Configure CI pipeline (GitHub Actions)

**Description:** Set up GitHub Actions for automated testing and deployment.

**Deliverables:**
- [x] `.github/workflows/ci.yml` - Lint, type check, test on PR/push

**Test Criteria:**
- [x] CI runs on PR
- [x] Tests pass before merge

---

### BZ-007: Integrate PostHog analytics

**Description:** Set up PostHog for product analytics as per `prd.md` analytics requirements.

**Reference:** `prd.md` section on analytics
- Event tracking: user_signup, agent_registered, task_created, task_completed, payment_initiated, payment_succeeded

**Deliverables:**
- [x] PostHog SDK integration in frontend
- [x] Environment variables for PostHog API key
- [x] Analytics context/provider setup

**Test Criteria:**
- [x] PostHog initializes on app load
- [x] Test events fire correctly

---

### BZ-008: Set up event tracking

**Description:** Implement tracking for core events.

**Reference:** `prd.md` - Event tracking requirements
| Event | Properties |
|-------|-----------|
| user_signup | wallet_address |
| agent_registered | agent_id, developer_id, category |
| task_created | task_id, swarm_id, escrow_amount |
| task_completed | task_id, agents_involved |
| payment_initiated | payment_type, amount |
| payment_succeeded | payment_type, amount, tx_hash |

**Deliverables:**
- [x] Event tracking utility functions
- [x] Track core platform events

**Test Criteria:**
- [x] Events appear in PostHog dashboard
- [x] Properties are correctly attached

---

## Phase 1: Wallet Authentication

### BZ-009: Build wallet nonce endpoint

**Description:** Create `POST /auth/wallet/nonce` endpoint.

**Reference:** `backend-tech-spec.md` lines 145-165
- `POST /auth/wallet/nonce` returns a short-lived message for the wallet address
- Bind nonces to address + expiry + one-time use

**Deliverables:**
- [x] `POST /auth/wallet/nonce` endpoint
- [x] Nonce generation with expiry (5 minutes)
- [x] Nonce storage (in-memory)

**Test Criteria:**
- [x] Returns signed message for wallet address
- [x] Nonce expires after configured time
- [x] Reusing nonce is rejected

---

### BZ-010: Build wallet signature verification endpoint

**Description:** Create `POST /auth/wallet/verify` endpoint accepting address + signature.

**Reference:** `backend-tech-spec.md` lines 145-165
- `POST /auth/wallet/verify` accepts `address` + `signature`
- Backend verifies signature against submitted wallet address

**Deliverables:**
- [x] `POST /auth/wallet/verify` endpoint
- [x] Signature verification logic
- [x] User upsert by wallet address

**Test Criteria:**
- [x] Valid signature creates/updates user
- [x] Invalid signature is rejected

---

### BZ-011: Implement JWT issuance

**Description:** Issue JWT tokens on successful wallet verification.

**Reference:** `backend-tech-spec.md` lines 145-165
- Backend issues its own signed JWT access token

**Deliverables:**
- [x] JWT generation on successful auth
- [x] Token includes userId, walletAddress
- [x] Configurable expiry

**Test Criteria:**
- [x] JWT returned on successful verification
- [x] Token is valid for subsequent requests

---

### BZ-012: Build frontend wallet connection flow

**Description:** Implement frontend auth flow.

**Deliverables:**
- [x] `context/auth-context.tsx` - Auth provider
- [x] Wallet connection component
- [x] Session persistence

**Test Criteria:**
- [x] User can connect wallet
- [x] Session persists on refresh

---

### BZ-013: Implement session persistence with /auth/me endpoint

**Description:** Create `/auth/me` endpoint and frontend integration.

**Deliverables:**
- [x] `GET /auth/me` endpoint
- [x] Frontend hook to fetch current user

**Test Criteria:**
- [x] `/auth/me` returns user data

---

### BZ-014: Add nonce expiry and replay protection

**Description:** Implement nonce expiry and replay protection.

**Deliverables:**
- [x] Nonce expiry validation
- [x] One-time use enforcement
- [x] Replay attack prevention

**Test Criteria:**
- [x] Expired nonce rejected
- [x] Replayed nonce rejected

---

## Phase 2: Agent Registry (ERC-8004)

### BZ-015: Deploy ERC-8004 Agent Registry smart contract

**Description:** Deploy ERC-8004 compliant agent registry on Celo.

**Reference:** `prd.md` section 4 - ERC-8004 Registry
- Agent identity, capabilities, pricing

**Deliverables:**
- [x] AgentRegistry contract deployment
- [x] Contract verified on Celo testnet

**Test Criteria:**
- [x] Contract deploys successfully
- [x] Agents can be registered on-chain

---

### BZ-016: Build agent registration endpoint

**Description:** Create `POST /agents` endpoint.

**Reference:** `backend-tech-spec.md` lines 135-145 (Agent API)
- Register new agent (developer)

**Deliverables:**
- [x] `POST /agents` endpoint
- [x] Agent entity creation
- [x] On-chain registration sync

**Test Criteria:**
- [x] Developer can register agent
- [x] Agent appears in registry

---

### BZ-017: Build agent listing endpoint

**Description:** Create `GET /agents` endpoint.

**Deliverables:**
- [x] `GET /agents` - List marketplace agents
- [x] Pagination
- [x] Basic filtering

**Test Criteria:**
- [x] Agents list returns correctly

---

### BZ-018: Build agent profile endpoint

**Description:** Create `GET /agents/:agentId` endpoint.

**Deliverables:**
- [x] `GET /agents/:agentId` - Agent details
- [x] Reputation data

**Test Criteria:**
- [x] Agent details return correctly

---

### BZ-019: Build agent update endpoint

**Description:** Create `PATCH /agents/:agentId` endpoint.

**Deliverables:**
- [x] `PATCH /agents/:agentId` - Update agent
- [x] Ownership validation

**Test Criteria:**
- [x] Developer can update their agent

---

### BZ-020: Build agent deletion endpoint

**Description:** Create `DELETE /agents/:agentId` endpoint.

**Deliverables:**
- [x] `DELETE /agents/:agentId` - Deactivate agent
- [x] Soft delete

**Test Criteria:**
- [x] Developer can deactivate agent

---

### BZ-021: Build agent verification (admin)

**Description:** Admin can verify agents.

**Deliverables:**
- [x] Admin verification endpoint
- [x] Verification status on agent

**Test Criteria:**
- [x] Admin can verify agents

---

## Phase 3: Agent Marketplace

### BZ-022: Build agent marketplace UI

**Description:** Create frontend agent marketplace.

**Reference:** `frontend-tech-spec.md` lines 150-165 (Agent Marketplace UX)

**Deliverables:**
- [x] Agent listing page
- [x] Agent cards
- [x] Grid/list view

**Test Criteria:**
- [x] Agents display in marketplace

---

### BZ-023: Add category filtering

**Description:** Filter agents by category.

**Deliverables:**
- [x] Category filter UI
- [x] Category filter API

**Test Criteria:**
- [x] Filters work correctly

---

### BZ-024: Add search functionality

**Description:** Search agents by keyword.

**Deliverables:**
- [x] Search input
- [x] Search API

**Test Criteria:**
- [x] Search returns relevant results

---

### BZ-025: Add sorting options

**Description:** Sort by reputation, price, completion count.

**Deliverables:**
- [x] Sort options UI
- [x] Sort API

**Test Criteria:**
- [x] Sorting works correctly

---

### BZ-026: Build agent profile page

**Description:** Create detailed agent profile page.

**Deliverables:**
- [x] Agent profile page
- [x] All agent details display
- [x] Pricing display

**Test Criteria:**
- [x] Profile displays correctly

---

## Phase 4: Swarm Formation

### BZ-027: Build swarm creation endpoint

**Description:** Create `POST /swarms` endpoint.

**Reference:** `backend-tech-spec.md` lines 135-145 (Swarm API)

**Deliverables:**
- [x] `POST /swarms` - Create custom swarm
- [x] Swarm entity

**Test Criteria:**
- [x] User can create swarm

---

### BZ-028: Build swarm listing endpoint

**Description:** Create `GET /swarms` endpoint.

**Deliverables:**
- [x] `GET /swarms` - List marketplace swarms
- [x] Public/private filtering

**Test Criteria:**
- [x] Swarms list returns correctly

---

### BZ-029: Build swarm detail endpoint

**Description:** Create `GET /swarms/:swarmId` endpoint.

**Deliverables:**
- [x] `GET /swarms/:swarmId` - Swarm details
- [x] Agent composition

**Test Criteria:**
- [x] Swarm details display

---

### BZ-030: Build swarm composer UI

**Description:** Visual swarm composition builder.

**Reference:** `frontend-tech-spec.md` lines 175-185 (Swarm Composition UX)

**Deliverables:**
- [x] Swarm builder UI
- [x] Agent selection
- [x] Execution order

**Test Criteria:**
- [x] User can compose swarm

---

### BZ-031: Build swarm pricing calculator

**Description:** Calculate total swarm price.

**Deliverables:**
- [x] Price calculation
- [x] Display total cost

**Test Criteria:**
- [x] Pricing accurate

---

## Phase 5: Task Execution

### BZ-032: Build task creation endpoint

**Description:** Create `POST /tasks` endpoint.

**Reference:** `backend-tech-spec.md` lines 135-145 (Task API)

**Deliverables:**
- [x] `POST /tasks` - Create new task
- [x] Task entity

**Test Criteria:**
- [x] Task creates successfully

---

### BZ-033: Build task listing endpoint

**Description:** Create `GET /tasks` endpoint.

**Deliverables:**
- [x] `GET /tasks` - User's tasks
- [x] Filtering by status

**Test Criteria:**
- [x] Tasks list returns

---

### BZ-034: Build task detail endpoint

**Description:** Create `GET /tasks/:taskId` endpoint.

**Deliverables:**
- [x] `GET /tasks/:taskId` - Task details
- [x] Step information

**Test Criteria:**
- [x] Task details display

---

### BZ-035: Build task step tracking

**Description:** Track individual agent steps.

**Reference:** `backend-tech-spec.md` lines 90-100 (TaskSteps)

**Deliverables:**
- [x] Task step entities
- [x] Step status tracking

**Test Criteria:**
- [x] Steps track correctly

---

### BZ-036: Build task dashboard UI

**Description:** Create task management UI.

**Reference:** `frontend-tech-spec.md` lines 190-210 (Task Execution UX)

**Deliverables:**
- [x] Task list page
- [x] Task detail page
- [x] Progress visualization

**Test Criteria:**
- [x] Task dashboard works

---

### BZ-037: Build task approval endpoint

**Description:** User approves task completion.

**Deliverables:**
- [x] Task approval endpoint
- [x] Completion status update

**Test Criteria:**
- [x] Approval triggers release

---

### BZ-038: Build task cancellation endpoint

**Description:** User cancels task.

**Deliverables:**
- [x] `POST /tasks/:taskId/cancel`
- [x] Cancellation logic

**Test Criteria:**
- [x] Cancellation works

---

### BZ-039: Build real-time task updates (Socket.IO)

**Description:** Real-time task progress.

**Reference:** `backend-tech-spec.md` lines 200-230 (Realtime Architecture)

**Deliverables:**
- [x] Socket.IO setup
- [x] Task status events
- [x] Frontend subscription

**Test Criteria:**
- [x] Real-time updates work

---

## Phase 6: Escrow Payments

### BZ-040: Build escrow lock endpoint

**Description:** Lock funds in escrow.

**Reference:** `backend-tech-spec.md` lines 235-255 (Payment Integration)

**Deliverables:**
- [x] `POST /payments/escrow/lock`
- [x] Escrow record creation

**Test Criteria:**
- [x] Funds lock correctly

---

### BZ-041: Build payment router (x402)

**Description:** Implement x402 payment streams.

**Reference:** `prd.md` section 4 - x402 Payment Router

**Deliverables:**
- [x] x402 integration
- [x] Payment routing

**Test Criteria:**
- [x] Payments route correctly

---

### BZ-042: Build escrow release endpoint

**Description:** Release funds to agents.

**Deliverables:**
- [x] `POST /payments/escrow/release`
- [x] Distribution calculation

**Test Criteria:**
- [x] Agents receive payment

---

### BZ-043: Build escrow refund endpoint

**Description:** Refund funds to user.

**Deliverables:**
- [x] `POST /payments/escrow/refund`
- [x] Refund calculation

**Test Criteria:**
- [x] Refund works

---

### BZ-044: Build payment history endpoint

**Description:** User payment history.

**Deliverables:**
- [x] `GET /payments/history`
- [x] Transaction listing

**Test Criteria:**
- [x] History displays

---

### BZ-045: Build platform fee calculation

**Description:** Calculate 5% platform fee.

**Reference:** `prd.md` section 6.3 - Revenue Flow
- Platform fee: 5%

**Deliverables:**
- [x] Fee calculation logic
- [x] Fee deduction

**Test Criteria:**
- [x] Fee correct

---

## Phase 7: Reputation System

### BZ-046: Build reputation oracle

**Description:** Aggregate reputation data.

**Reference:** `backend-tech-spec.md` lines 105-115 (Reputation)

**Deliverables:**
- [x] Reputation entity
- [x] Score calculation

**Test Criteria:**
- [x] Scores calculate correctly

---

### BZ-047: Build review submission

**Description:** Submit review after task.

**Deliverables:**
- [x] `POST /reviews`
- [x] Rating (1-5 stars)

**Test Criteria:**
- [x] Review submits

---

### BZ-048: Build on-chain score sync

**Description:** Sync with ERC-8004 on-chain scores.

**Deliverables:**
- [x] On-chain score fetch
- [x] Score sync job

**Test Criteria:**
- [x] Scores sync

---

### BZ-049: Display reputation on profiles

**Description:** Show reputation scores.

**Deliverables:**
- [x] Reputation display
- [x] Rating stars

**Test Criteria:**
- [x] Reputation visible

---

## Phase 8: Disputes

### BZ-050: Build dispute creation

**Description:** Raise dispute on task.

**Reference:** `backend-tech-spec.md` lines 120-130 (Disputes)

**Deliverables:**
- [x] `POST /tasks/:taskId/dispute`
- [x] Dispute entity

**Test Criteria:**
- [x] Dispute creates

---

### BZ-051: Build dispute listing (admin)

**Description:** Admin views disputes.

**Deliverables:**
- [x] `GET /admin/disputes`
- [x] Queue management

**Test Criteria:**
- [x] Disputes visible

---

### BZ-052: Build dispute resolution

**Description:** Resolve dispute.

**Deliverables:**
- [x] `POST /admin/disputes/:disputeId/resolve`
- [x] Resolution logic

**Test Criteria:**
- [x] Resolution works

---

### BZ-053: Build slash mechanism

**Description:** Slash malicious agent stake.

**Deliverables:**
- [x] Slash calculation
- [x] Stake deduction

**Test Criteria:**
- [x] Slash executes

---

## Phase 9: Admin Panel

### BZ-054: Build admin metrics endpoint

**Description:** Platform metrics API.

**Deliverables:**
- [x] `GET /admin/metrics`
- [x] DAU, tasks, volume

**Test Criteria:**
- [x] Metrics return

---

### BZ-055: Build admin agent management

**Description:** Agent management UI.

**Deliverables:**
- [x] `/admin/agents` page
- [x] Verify, deactivate

**Test Criteria:**
- [x] Management works

---

### BZ-056: Build admin task oversight

**Description:** Task oversight UI.

**Deliverables:**
- [x] `/admin/tasks` page
- [x] View, cancel

**Test Criteria:**
- [x] Oversight works

---

### BZ-057: Build admin payment operations

**Description:** Payment operations UI.

**Deliverables:**
- [x] `/admin/payments` page
- [x] Transaction lookup

**Test Criteria:**
- [x] Operations work

---

## Phase 10: Production Hardening

### BZ-058: Implement rate limiting

**Description:** Add rate limits.

**Deliverables:**
- [x] Redis rate limiting
- [x] Limit enforcement

**Test Criteria:**
- [x] Limits enforced

---

### BZ-059: Add Redis caching

**Description:** Cache agent listings.

**Deliverables:**
- [x] Cache layer
- [x] TTL

**Test Criteria:**
- [x] Caching works

---

### BZ-060: Add structured logging

**Description:** Implement structured logs.

**Deliverables:**
- [x] JSON logging
- [x] Request IDs

**Test Criteria:**
- [x] Logs structured

---

### BZ-061: Set up staging environment

**Description:** Create staging.

**Deliverables:**
- [x] Staging config
- [x] CI deployment

**Test Criteria:**
- [x] Staging works

---

### BZ-062: Build smoke test suite

**Description:** Create critical path tests.

**Deliverables:**
- [x] Signup test
- [x] Agent registration test
- [x] Task creation test

**Test Criteria:**
- [x] Tests pass

---

## Labels

```
priority: critical
priority: high
priority: medium
priority: low

type: backend
type: frontend
type: infrastructure
type: analytics
type: smart-contract

phase: 0
phase: 1
phase: 2
phase: 3
phase: 4
phase: 5
phase: 6
phase: 7
phase: 8
phase: 9
phase: 10

category: auth
category: agents
category: swarms
category: tasks
category: payments
category: reputation
category: disputes
category: admin
category: realtime
category: hardening
category: analytics
```

## Milestones

- **M1: Foundation** - Phase 0 complete (BZ-001 to BZ-008)
- **M2: Auth** - Phase 1 complete (BZ-009 to BZ-014)
- **M3: Registry** - Phase 2 complete (BZ-015 to BZ-021)
- **M4: Marketplace** - Phase 3 complete (BZ-022 to BZ-026)
- **M5: Swarms** - Phase 4 complete (BZ-027 to BZ-031)
- **M6: Tasks** - Phase 5 complete (BZ-032 to BZ-039)
- **M7: Payments** - Phase 6 complete (BZ-040 to BZ-045)
- **M8: Reputation** - Phase 7 complete (BZ-046 to BZ-049)
- **M9: Disputes** - Phase 8 complete (BZ-050 to BZ-053)
- **M10: Admin** - Phase 9 complete (BZ-054 to BZ-057)
- **M11: Launch** - Phase 10 complete (BZ-058 to BZ-062)
