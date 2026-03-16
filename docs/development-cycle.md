# SwarmFund Development Cycle

## Principle

Build SwarmFund one feature at a time in a strict linear sequence.

For every feature:

1. define scope
2. implement backend
3. implement frontend
4. test the feature fully
5. fix issues
6. freeze that feature before starting the next one

No parallel half-finished features.

## Why This Order Matters

| Phase | Feature | Status | Rationale |
|-------|---------|--------|-----------|
| 0 | Scaffold + Analytics | [ ] | Measure from day one |
| 1 | Wallet Auth | [ ] | Can't do anything without this |
| 2 | Agent Registry (ERC-8004) | [ ] | Core protocol, developer onboarding |
| 3 | Agent Marketplace | [ ] | User discovery of agents |
| 4 | Swarm Formation | [ ] | Multi-agent coordination |
| 5 | Task Execution | [ ] | Core value delivery |
| 6 | Escrow Payments | [ ] | Monetization foundation |
| 7 | Reputation System | [ ] | Trust layer |
| 8 | Disputes | [ ] | Conflict resolution |
| 9 | Admin Panel | [ ] | Platform oversight |
| 10 | Hardening | [ ] | Production readiness |

## Delivery Rule

Each feature is only considered complete when all of the following are true:

- backend code exists
- frontend UI exists
- happy path works end to end
- edge cases were tested
- logs/errors are acceptable
- feature notes are documented

## Revised Linear Sequence

## Phase 0: Project Foundation + Analytics [ ]

**CRITICAL**: Add analytics BEFORE building features.

Deliver:

- [ ] backend project scaffold
- [ ] frontend project scaffold
- [ ] Postgres + TypeORM setup
- [ ] auth shell
- [ ] component system shell
- [ ] CI basics

**Analytics (MUST HAVE)**:

- [ ] Event tracking: user_signup, agent_registered, task_created, task_completed, payment_initiated, payment_succeeded
- [ ] Daily metrics: DAU, active_agents, tasks_completed
- [ ] Conversion funnel: signup → first_agent_view → first_task → first_payment

Tools: **PostHog** (self-hosted or cloud)

Test before moving on:

- [ ] backend boots
- [ ] frontend boots
- [ ] database connects
- [ ] health endpoints work
- [ ] auth context initializes cleanly
- [ ] analytics events fire correctly

## Phase 1: Wallet Authentication [ ]

Deliver:

- [ ] wallet nonce endpoint
- [ ] wallet signature verification endpoint
- [ ] JWT issuance
- [ ] frontend wallet connection flow
- [ ] session persistence and `/auth/me`

Test before moving on:

- [ ] user can connect wallet
- [ ] backend verifies signature
- [ ] JWT survives refresh
- [ ] invalid signature is rejected
- [ ] replayed nonce is rejected

## Phase 2: Agent Registry (ERC-8004) [ ]

**CRITICAL**: Core protocol infrastructure, enables developer onboarding.

Deliver:

- [ ] ERC-8004 Agent Registry smart contract
- [ ] Agent registration endpoint
- [ ] Agent profile management
- [ ] Agent verification endpoint (admin)
- [ ] Agent listing by category

**Agent Model**:

- [x] name, description, category
- [x] capabilities (jsonb)
- [x] pricing model (perTask, perHour, subscription)
- [x] stake amount (CELO for reputation)

Test before moving on:

- [ ] developer can register agent
- [ ] agent appears in registry
- [ ] admin can verify agents
- [ ] agent metadata persists correctly

## Phase 3: Agent Marketplace [ ]

Deliver:

- [ ] Agent listing API (browse, filter, search)
- [ ] Agent profile page
- [ ] Category filtering
- [ ] Reputation display
- [ ] Agent card UI
- [ ] Search by natural language (basic keyword matching)

**Discovery Features**:

- [ ] Filter by category
- [ ] Filter by price range
- [ ] Filter by rating
- [ ] Sort by reputation, price, completion count

Test before moving on:

- [ ] agents display in marketplace
- [ ] filters work correctly
- [ ] agent profiles show all details
- [ ] search returns relevant results

## Phase 4: Swarm Formation [ ]

Deliver:

- [ ] Swarm creation API
- [ ] Pre-composed swarm listings
- [ ] Dynamic swarm suggestion engine
- [ ] Swarm profile page
- [ ] Add agent to swarm UI
- [ ] Swarm composition visualization

**Swarm Features**:

- [ ] Public swarms (marketplace)
- [ ] Private swarms (user-created)
- [ ] Swarm templates

Test before moving on:

- [ ] swarms can be created
- [ ] agents can be added to swarms
- [ ] swarm execution order configurable
- [ ] swarm pricing calculated correctly

## Phase 5: Task Execution [ ]

**CRITICAL**: Core value delivery - users hire agents to accomplish tasks.

Deliver:

- [ ] Task creation endpoint
- [ ] Task assignment to swarm
- [ ] Task status tracking
- [ ] Task step execution
- [ ] Task completion approval
- [ ] Task dashboard UI
- [ ] Real-time task progress

**Task Features**:

- [ ] Natural language task description
- [ ] Parameter input UI
- [ ] Step-by-step execution flow
- [ ] Output delivery

Test before moving on:

- [ ] task creates successfully
- [ ] swarm executes task
- [ ] steps complete in order
- [ ] user can approve completion
- [ ] real-time updates work

## Phase 6: Escrow Payments [ ]

**CRITICAL**: Monetization foundation - enables economic interactions.

Deliver:

- [ ] Escrow lock endpoint
- [ ] Payment router (x402 integration)
- [ ] Escrow release endpoint
- [ ] Escrow refund endpoint
- [ ] Payment history
- [ ] Platform fee calculation

**Payment Features**:

- [ ] cUSD payments
- [ ] CELO payments
- [ ] Multi-agent payment distribution
- [ ] Failed payment handling

Test before moving on:

- [ ] funds lock in escrow
- [ ] agents receive payment on completion
- [ ] platform fee calculated correctly
- [ ] refunds work for cancelled tasks

## Phase 7: Reputation System [ ]

**CRITICAL**: Trust layer for autonomous economic actors.

Deliver:

- [ ] Reputation oracle
- [ ] Review submission after task
- [ ] Rating aggregation
- [ ] On-chain score sync (ERC-8004)
- [ ] Reputation display on agent profiles

**Reputation Features**:

- [ ] Star ratings (1-5)
- [ ] Review text
- [ ] Stake amount display
- [ ] Completion rate
- [ ] Average response time

Test before moving on:

- [ ] reviews can be submitted
- [ ] ratings aggregate correctly
- [ ] on-chain scores update
- [ ] reputation affects visibility

## Phase 8: Disputes [ ]

Deliver:

- [ ] Dispute creation endpoint
- [ ] Dispute status tracking
- [ ] Admin resolution interface
- [ ] Slash mechanism for malicious agents
- [ ] Fund recovery for failed tasks

**Dispute Features**:

- [ ] Raise dispute UI
- [ ] Evidence submission
- [ ] Resolution workflow
- [ ] Appeal process

Test before moving on:

- [ ] disputes can be raised
- [ ] admin can resolve
- [ ] slashed amounts correct
- [ ] funds distribute correctly

## Phase 9: Admin Panel [ ]

**CRITICAL**: Without operational controls, you become the bottleneck.

Deliver:

### Backend Admin API

- [ ] metrics endpoints
- [ ] queue dashboard
- [ ] payment summaries
- [ ] DAU, tasks, volume reports
- [ ] Agent verification queue

### Admin Dashboard (Frontend)

- [ ] `/admin/agents` - List, verify, deactivate agents
- [ ] `/admin/tasks` - View all tasks, status
- [ ] `/admin/disputes` - Dispute queue, resolution
- [ ] `/admin/payments` - Transaction lookup, stuck payments
- [ ] `/admin/metrics` - Platform health, volume

### Critical Admin Functions

| Function | Priority | Deliverable |
|----------|----------|-------------|
| Agent management | Critical | Verify, deactivate, slash |
| Task oversight | Critical | View, cancel, refund |
| Dispute resolution | Critical | Resolve, slash, release |
| Payment ops | High | Transaction lookup |
| System health | High | Queue depths, errors |
| Platform metrics | Medium | Volume, agents, users |

Test before moving on:

- [ ] metrics are accurate
- [ ] queues are observable
- [ ] admin access protected
- [ ] admin can manage agents

## Phase 10: Production Hardening [ ]

Deliver:

- [ ] rate limiting
- [ ] Redis caching for agent listings
- [ ] structured logs
- [ ] staging environment
- [ ] smoke test suite

Test before moving on:

- [ ] critical paths survive restart
- [ ] payments reconcile correctly
- [ ] auth and task flows pass smoke tests

## Feature Execution Template

Use this exact cycle for each feature.

### 1. Define

- user story
- acceptance criteria
- API contract
- DB changes
- UI states

### 2. Build backend

- entities
- migrations
- repository
- service
- controller/route
- tests

### 3. Build frontend

- API client integration
- React Query hooks
- page/component states
- loading/error/empty/success states

### 4. Test end to end

- manual happy path
- invalid input path
- permission path
- mobile viewport check
- logging review

### 5. Push to dev branch

- commit changes with descriptive message
- push to `origin dev` branch
- verify CI passes

### 6. Freeze

- update docs
- record known limitations
- only then start the next feature

## Testing Standard Per Feature

Minimum required before advancing:

- one backend integration test
- one frontend interaction test or QA checklist
- one manual end-to-end test run
- one regression note added if the feature affects prior behavior

## Final Recommendation

SwarmFund must be built in core-first order. Agent registry BEFORE marketplace. Task execution BEFORE payments. This sequence ensures the product is viable before scaling.
