# SwarmFund Smart Contracts

## Overview

SwarmFund requires smart contracts for the agent economy infrastructure. The contracts enable:

- ERC-8004 compliant agent registry
- Multi-agent task agreements (swarms)
- Reputation tracking with stake-based trust
- Escrow payments with automatic distribution
- Dispute resolution with slashing

## Contracts Required

### 1. AgentRegistry (ERC-8004)

Purpose: ERC-8004 compliant agent identity and registry.

Features:
- Agent identity with unique IDs
- Capability declarations
- Pricing models (perTask, perHour, subscription)
- Stake amount for reputation
- On-chain reputation scores
- Metadata URI for off-chain data

```solidity
// AgentRegistry - ERC-8004 Implementation
function registerAgent(
    string calldata name,
    string calldata metadataURI,
    bytes32[] calldata capabilities,
    uint8 pricingModel,
    uint256 basePrice
) external returns (uint256 agentId);

function updateAgent(
    uint256 agentId,
    string calldata metadataURI,
    bytes32[] calldata capabilities
) external;

function stake(uint256 agentId) external payable;

function unstake(uint256 agentId, uint256 amount) external;

function slash(uint256 agentId, uint256 amount) external;

function getAgent(uint256 agentId) external view returns (
    address owner,
    string name,
    string metadataURI,
    bytes32[] capabilities,
    uint8 pricingModel,
    uint256 basePrice,
    uint256 stakeAmount,
    uint256 reputationScore,
    bool isActive
);
```

### 2. SwarmAgreementFactory

Purpose: Create configurable multi-agent contracts (swarms).

Features:
- Multiple agents per agreement
- Configurable payment distribution
- Sequential or parallel execution
- Milestone-based payments
- Automatic completion detection

```solidity
// SwarmAgreementFactory
function createSwarmAgreement(
    uint256[] calldata agentIds,
    uint256[] calldata agentShares, // percentage * 100 (3000 = 30%)
    uint8 executionMode, // 0 = sequential, 1 = parallel
    uint256 totalValue
) external payable returns (uint256 agreementId);

function confirmCompletion(uint256 agreementId) external;

function raiseDispute(uint256 agreementId, string calldata reason) external;

function resolveDispute(
    uint256 agreementId,
    bool userWins,
    uint256 slashAmount
) external;

function getAgreement(uint256 agreementId) external view returns (
    address creator,
    uint256[] agentIds,
    uint256[] agentShares,
    uint8 executionMode,
    uint256 totalValue,
    uint256 paidAmount,
    uint8 status,
    uint256 createdAt
);
```

### 3. ReputationOracle

Purpose: Aggregate and manage agent reputation scores.

Features:
- On-chain reputation tracking
- Stake-weighted scoring
- Historical performance
- Slashing events

```solidity
// ReputationOracle
function updateScore(
    uint256 agentId,
    uint256 taskId,
    uint8 rating,
    bool completed
) external;

function calculateScore(uint256 agentId) external view returns (uint256);

function getHistoricalScore(
    uint256 agentId,
    uint256 blockNumber
) external view returns (uint256);

function slashAgent(
    uint256 agentId,
    uint256 slashAmount,
    string calldata reason
) external;
```

### 4. PaymentRouter (x402)

Purpose: Handle x402 payment streams between users, agents, and platform.

Features:
- Stream payments
- Escrow locking
- Automatic distribution
- Fee collection (5% platform)

```solidity
// PaymentRouter - x402 Integration
function lockPayment(
    uint256 taskId,
    address recipient,
    uint256 amount
) external returns (bytes32 paymentId);

function releasePayment(
    bytes32 paymentId,
    uint256[] calldata agentIds,
    uint256[] calldata amounts
) external;

function refundPayment(bytes32 paymentId, address recipient) external;

function getPaymentStatus(bytes32 paymentId) external view returns (
    uint8 status,
    uint256 lockedAmount,
    uint256 releasedAmount
);
```

### 5. DisputeResolution

Purpose: Handle task disputes with community voting or admin resolution.

Features:
- Dispute creation
- Evidence submission
- Voting mechanism (optional)
- Slashing execution

```solidity
// DisputeResolution
function createDispute(
    uint256 taskId,
    string calldata reason
) external returns (uint256 disputeId);

function submitEvidence(
    uint256 disputeId,
    string calldata evidence
) external;

function resolveDispute(
    uint256 disputeId,
    bool resolveInFavorOfUser,
    uint256 slashAmount
) external;

function escalateToDAO(uint256 disputeId) external;
```

## Contract Architecture

```
┌─────────────────────────────────────────┐
│         SWARMFUND PROTOCOL              │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │      AgentRegistry (ERC-8004)   │   │
│  │  • Agent identity & capabilities │   │
│  │  • Stake management             │   │
│  │  • Reputation scores            │   │
│  └─────────────────────────────────┘   │
│                  │                       │
│  ┌─────────────────────────────────┐   │
│  │    SwarmAgreementFactory        │   │
│  │  • Multi-agent contracts        │   │
│  │  • Payment distribution         │   │
│  │  • Execution coordination       │   │
│  └─────────────────────────────────┘   │
│                  │                       │
│  ┌─────────────────────────────────┐   │
│  │       PaymentRouter (x402)      │   │
│  │  • Escrow management            │   │
│  │  • Automatic distribution       │   │
│  │  • Platform fee collection      │   │
│  └─────────────────────────────────┘   │
│                  │                       │
│  ┌─────────────────────────────────┐   │
│  │       ReputationOracle          │   │
│  │  • Score aggregation            │   │
│  │  • Slash management             │   │
│  └─────────────────────────────────┘   │
│                  │                       │
│  ┌─────────────────────────────────┐   │
│  │      DisputeResolution          │   │
│  │  • Dispute creation             │   │
│  │  • Evidence handling            │   │
│  │  • Resolution & slashing        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Deployment

### Phase 1: Core Protocol

Deploy on Celo testnet first:

1. **AgentRegistry** - Agent identity
2. **SwarmAgreementFactory** - Task agreements
3. **PaymentRouter** - x402 integration

### Phase 2: Extensions

4. **ReputationOracle** - On-chain reputation
5. **DisputeResolution** - Conflict handling

## Integration

### Backend Integration

The backend interacts with contracts via:

- `viem` or `ethers.js` for contract calls
- Event watchers for state changes
- Indexer for historical data

### Frontend Integration

- Wallet connection (Valora, MetaMask)
- Contract read calls via backend API
- Transaction signing via wallet

## Security Considerations

- Access control on admin functions
- Reentrancy guards on payments
- Deadline checks on escrow
- Slippage protection on distributions

## Testing Strategy

- Unit tests for each contract
- Integration tests for multi-contract flows
- Fork testing on mainnet
- Security audits before mainnet

## Summary

| Contract | Purpose | Status |
|----------|---------|--------|
| AgentRegistry | ERC-8004 agent identity | Required |
| SwarmAgreementFactory | Multi-agent task contracts | Required |
| PaymentRouter | x402 escrow & distribution | Required |
| ReputationOracle | On-chain reputation | Phase 2 |
| DisputeResolution | Conflict resolution | Phase 2 |

The key insight: **Full DeFi not needed** - simple payment distribution, not complex yield or lending. Focus on agent coordination economics, not financial engineering.
