// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract AgentRegistry is Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.UintSet;

    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MAX_STAKE = 1000000e18;

    enum PricingModel {
        PER_TASK,
        PER_HOUR,
        SUBSCRIPTION
    }

    struct Agent {
        address owner;
        string name;
        string metadataURI;
        bytes32[] capabilities;
        PricingModel pricingModel;
        uint256 basePrice;
        uint256 stakeAmount;
        uint256 reputationScore;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(uint256 => Agent) public agents;
    mapping(address => uint256[]) public ownerToAgents;
    mapping(uint256 => EnumerableSet.UintSet) private taskIdsByAgent;
    mapping(uint256 => uint256[]) private ratingsByAgent;
    mapping(address => bool) public authorizedVerifiers;

    uint256 public nextAgentId;
    uint256 public totalRegisteredAgents;

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        PricingModel pricingModel,
        uint256 basePrice
    );
    event AgentUpdated(uint256 indexed agentId, string metadataURI, bytes32[] capabilities);
    event StakeDeposited(uint256 indexed agentId, address indexed owner, uint256 amount);
    event StakeWithdrawn(uint256 indexed agentId, address indexed owner, uint256 amount);
    event AgentSlashed(uint256 indexed agentId, uint256 amount, string reason);
    event AgentVerified(uint256 indexed agentId, bool verified);

    modifier onlyAuthorized() {
        require(
            authorizedVerifiers[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    constructor() Ownable() {
        nextAgentId = 1;
        authorizedVerifiers[owner()] = true;
    }

    function registerAgent(
        string calldata name,
        string calldata metadataURI,
        bytes32[] calldata capabilities,
        PricingModel pricingModel,
        uint256 basePrice
    ) external returns (uint256 agentId) {
        require(bytes(name).length > 0, "Name required");
        require(basePrice > 0, "Base price required");

        agentId = nextAgentId++;
        Agent storage agent = agents[agentId];

        agent.owner = msg.sender;
        agent.name = name;
        agent.metadataURI = metadataURI;
        agent.capabilities = capabilities;
        agent.pricingModel = pricingModel;
        agent.basePrice = basePrice;
        agent.stakeAmount = 0;
        agent.reputationScore = 0;
        agent.isActive = true;
        agent.createdAt = block.timestamp;
        agent.updatedAt = block.timestamp;

        ownerToAgents[msg.sender].push(agentId);
        totalRegisteredAgents++;

        emit AgentRegistered(agentId, msg.sender, name, pricingModel, basePrice);
    }

    function updateAgent(
        uint256 agentId,
        string calldata metadataURI,
        bytes32[] calldata capabilities
    ) external {
        require(agentId > 0 && agentId < nextAgentId, "Invalid agent ID");
        Agent storage agent = agents[agentId];
        require(agent.owner == msg.sender, "Not owner");
        require(agent.isActive, "Agent not active");

        agent.metadataURI = metadataURI;
        agent.capabilities = capabilities;
        agent.updatedAt = block.timestamp;

        emit AgentUpdated(agentId, metadataURI, capabilities);
    }

    function stake(uint256 agentId) external payable nonReentrant {
        require(agentId > 0 && agentId < nextAgentId, "Invalid agent ID");
        Agent storage agent = agents[agentId];
        require(agent.owner == msg.sender, "Not owner");
        require(agent.isActive, "Agent not active");
        require(msg.value > 0, " stakeAmount must be > 0");
        require(
            agent.stakeAmount + msg.value <= MAX_STAKE,
            "Max stake exceeded"
        );

        agent.stakeAmount += msg.value;
        agent.updatedAt = block.timestamp;

        emit StakeDeposited(agentId, msg.sender, msg.value);
    }

    function unstake(uint256 agentId, uint256 amount) external nonReentrant {
        require(agentId > 0 && agentId < nextAgentId, "Invalid agent ID");
        Agent storage agent = agents[agentId];
        require(agent.owner == msg.sender, "Not owner");
        require(amount > 0, "Amount must be > 0");
        require(agent.stakeAmount >= amount, "Insufficient stake");

        agent.stakeAmount -= amount;
        agent.updatedAt = block.timestamp;

        payable(msg.sender).transfer(amount);

        emit StakeWithdrawn(agentId, msg.sender, amount);
    }

    function slash(uint256 agentId, uint256 amount) external onlyAuthorized nonReentrant {
        require(agentId > 0 && agentId < nextAgentId, "Invalid agent ID");
        Agent storage agent = agents[agentId];
        require(agent.stakeAmount >= amount, "Insufficient stake");

        agent.stakeAmount -= amount;
        agent.reputationScore = agent.reputationScore > 100 ? agent.reputationScore - 100 : 0;
        agent.updatedAt = block.timestamp;

        emit AgentSlashed(agentId, amount, "Slashed by oracle");
    }

    function submitRating(uint256 agentId, uint8 rating) external onlyAuthorized {
        require(agentId > 0 && agentId < nextAgentId, "Invalid agent ID");
        require(rating >= 1 && rating <= 5, "Rating must be 1-5");

        ratingsByAgent[agentId].push(rating);
        _updateReputation(agentId);
    }

    function _updateReputation(uint256 agentId) internal {
        uint256[] storage ratings = ratingsByAgent[agentId];
        if (ratings.length == 0) return;

        uint256 sum;
        for (uint256 i = 0; i < ratings.length; i++) {
            sum += ratings[i];
        }
        uint256 avgRating = (sum * 100) / ratings.length;

        Agent storage agent = agents[agentId];
        uint256 stakeWeight = agent.stakeAmount > 0 
            ? (agent.stakeAmount / 1e18) * 10 
            : 0;
        
        agent.reputationScore = avgRating + stakeWeight;
        if (agent.reputationScore > 1000) agent.reputationScore = 1000;
    }

    function getAgent(
        uint256 agentId
    )
        external
        view
        returns (
            address owner,
            string memory name,
            string memory metadataURI,
            bytes32[] memory capabilities,
            PricingModel pricingModel,
            uint256 basePrice,
            uint256 stakeAmount,
            uint256 reputationScore,
            bool isActive
        )
    {
        require(agentId > 0 && agentId < nextAgentId, "Invalid agent ID");
        Agent memory agent = agents[agentId];
        return (
            agent.owner,
            agent.name,
            agent.metadataURI,
            agent.capabilities,
            agent.pricingModel,
            agent.basePrice,
            agent.stakeAmount,
            agent.reputationScore,
            agent.isActive
        );
    }

    function getAgentCount() external view returns (uint256) {
        return nextAgentId - 1;
    }

    function getAgentIdsByOwner(
        address owner
    ) external view returns (uint256[] memory) {
        return ownerToAgents[owner];
    }

    function setVerifier(
        address verifier,
        bool authorized
    ) external onlyOwner {
        authorizedVerifiers[verifier] = authorized;
    }

    function getRatingCount(uint256 agentId) external view returns (uint256) {
        return ratingsByAgent[agentId].length;
    }
}
