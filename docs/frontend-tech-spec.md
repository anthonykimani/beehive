# SwarmFund Frontend Tech Spec

## Purpose

This document defines the frontend architecture and UI system for SwarmFund. It is based on:

- the product requirements in `docs/prd.md`
- the scalable Next.js app patterns
- the explicit visual direction for agent coordination platforms

This frontend must feel professional, trustworthy, and efficient while remaining production-ready and component-driven.

## Frontend Principles

- mobile-first always
- clear, professional, high-clarity UI
- no visible crypto complexity
- all pricing explained in plain USD language
- backend-driven business logic, frontend-driven usability
- reusable component system over one-off page styling

## Product Experience Goals

The app should feel like:

- a modern professional marketplace
- efficient agent coordination platform
- trustworthy transaction system

The app should not feel like:

- a crypto dashboard
- a dark fintech console
- a generic Tailwind tutorial clone

## Recommended Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style component system
- React Query for server state
- PostHog for product analytics
- Zod for client-side form validation alignment
- Zustand or Context only for lightweight local UI state

## Design System Direction

### Design tokens

Use CSS variables for:

- `--background`
- `--foreground`
- `--card`
- `--primary`
- `--secondary`
- `--accent`
- `--success`
- `--warning`
- `--destructive`
- `--muted`
- `--border`
- `--radius`

### Visual style

- clean, professional surfaces
- rounded corners with subtle softness
- clear action buttons
- strong use of blues, greens, and neutral tones
- subtle shadows and layered cards
- clear iconography and affirmative states

### Typography

- clean sans-serif headline font
- readable body font
- strong use of weight contrast for hierarchy

## Component System

All product UI should be built on reusable components.

### Foundation components

- `Button`
- `Input`
- `Textarea`
- `Select`
- `Checkbox`
- `RadioGroup`
- `Dialog`
- `Drawer`
- `Tabs`
- `Badge`
- `Avatar`
- `Card`
- `Toast`
- `Progress`
- `Skeleton`

### Product components

- `AgentCard`
- `SwarmCard`
- `TaskCard`
- `TaskStep`
- `AgentProfile`
- `SwarmComposer`
- `PaymentStatus`
- `EscrowIndicator`
- `ReputationBadge`
- `PricingDisplay`
- `CategoryFilter`
- `SearchInput`

### Layout components

- `AppShell`
- `Header`
- `BottomNav`
- `PageSection`
- `StickyActionBar`

## Proposed Frontend Folder Structure

```text
app/
  (marketing)/
  (app)/
    auth/
    agents/
    swarms/
    tasks/
    dashboard/
    settings/
  layout.tsx
  globals.css
components/
  ui/
  layout/
  agents/
  swarms/
  tasks/
  payments/
  shared/
hooks/
lib/
  api/
  types/
  utils/
  constants/
provider/
  query-provider.tsx
  auth-provider.tsx
  theme-provider.tsx
context/
```

## Route Model

### Public / session routes

- `/auth`
- `/agents` (public marketplace)

### App routes

- `/dashboard`
- `/agents`
- `/agents/[agentId]`
- `/swarms`
- `/swarms/[swarmId]`
- `/tasks`
- `/tasks/[taskId]`
- `/tasks/new`
- `/settings`

The route model keeps the same simple mental map users already understand from professional platforms.

## Admin Dashboard

The product needs an operational interface for live decisions.

### Route: `/admin` (protected, superuser only)

### Admin Pages

```
/admin
├── /agents
│   ├── List (filter: verified, unverified, active, banned)
│   ├── Detail (profile, activity, earnings)
│   └── Actions (verify, deactivate, slash)
├── /tasks
│   ├── List (filter: status, date)
│   └── Detail (steps, payments, dispute)
├── /disputes
│   ├── Queue (open disputes)
│   ├── History (resolved)
│   └── Resolution (evidence, decision)
├── /payments
│   ├── Stuck transactions
│   └── Revenue summary
└── /metrics
    ├── DAU, WAU, MAU
    ├── Tasks completed
    └── Volume
```

### Critical Admin Functions

| Function | Priority | Description |
|----------|----------|-------------|
| Agent management | Critical | Verify, deactivate, slash |
| Task oversight | Critical | View, cancel, refund |
| Dispute resolution | Critical | Resolve, slash, release |
| Payment ops | High | Transaction lookup |
| System health | High | Queue depths, error rates |
| Growth metrics | Medium | Signups, volume, agents |

## State Management

### Server state

Use React Query for:

- current user
- agent listings
- swarm compositions
- task status
- payment history
- reputation scores

### Local UI state

Use component state or a small store for:

- task creation wizard step
- modal/drawer visibility
- agent selection for swarm
- payment confirmation state

Do not use global client state for backend truth that already belongs in React Query.

## API Integration Pattern

The frontend must talk only to the custom Express API.

### API client shape

- `lib/api/client.ts` for fetch wrapper
- `lib/api/auth.ts`
- `lib/api/agents.ts`
- `lib/api/swarms.ts`
- `lib/api/tasks.ts`
- `lib/api/payments.ts`

Rules:

- attach Bearer token automatically
- normalize API envelopes
- centralize error translation into user-friendly messages
- keep payment initiation and confirmation flows typed

## Auth UX

Frontend auth should feel invisible.

Requirements:

- automatic wallet-aware session bootstrap
- no crypto jargon
- wallet is presented as account identity
- fast resume when reopening

Screens:

- lightweight auth gate
- session-expired recovery screen

## Agent Marketplace UX

The agent marketplace is the primary discovery mechanism.

Requirements:

- grid or list view of agent cards
- clear category filters
- search by keyword
- sort by reputation, price, completion count
- agent cards show: name, category, rating, price, completed tasks

Premium entry points:

- featured agents section
- top-rated agents
- category highlights

## Swarm Composition UX

Users can create custom swarms or hire pre-composed ones.

Requirements:

- visual swarm composition builder
- drag-and-drop agent selection
- execution order configuration
- total price calculation
- save as template option

## Task Execution UX

The task execution experience is the core value delivery.

Requirements:

- task creation wizard
- natural language task description
- parameter input form
- real-time execution progress
- step-by-step status visualization
- output delivery display
- approval/dispute buttons

Real-time updates:

- step status changes
- progress percentage
- agent activity logs

## Payment UX

Payments should feel simple and trustworthy.

Requirements:

- clear pricing display in USD
- escrow indicator
- payment confirmation flow
- payment history view

Flow:

1. User reviews task/agent pricing
2. Locks funds to escrow
3. Executes task
4. Approves completion → funds released
5. Or raises dispute → funds held

## Responsive Behavior

Primary target is web browser, but the app should also work on mobile.

### Mobile priorities

- thumb-friendly controls
- bottom navigation
- sticky primary actions

### Desktop behavior

- centered app shell with max width
- maintain clean visual character

## Motion Guidelines

Use motion intentionally.

- task progress animations
- step completion transitions
- payment confirmation feedback
- drawer and sheet interactions

Avoid noisy animation loops or heavy parallax.

## Accessibility Requirements

- keyboard reachable controls on web
- strong color contrast
- large tap targets
- visible focus states
- semantic form labels

## Frontend Performance Guidelines

- optimize image loading and avatars
- use route-level code splitting naturally via App Router
- cache lists with React Query
- avoid over-hydrating static layouts
- prefer skeletons over layout shifts

## Frontend Testing Scope

- component tests for critical UI primitives
- flow tests for task creation and payment initiation
- API integration tests for auth/session boot and query hooks
- visual QA for layouts

## Phase 1 Frontend Scope

Must ship:

- auth gate
- agent marketplace
- agent profile pages
- swarm listing and creation
- task creation
- task dashboard
- payment flow
- admin panel

Can wait:

- advanced notifications center
- voice interface
- advanced desktop enhancements
- AI-powered swarm suggestions

## Final Recommendation

SwarmFund should use a Next.js App Router frontend with a strict reusable component system. Functional product structure should support the three-sided marketplace model (users, developers, protocol), and the UI should be clean, professional, and trustworthy.
