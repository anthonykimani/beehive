// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract DisputeResolution is Ownable, ReentrancyGuard {
    enum DisputeStatus {
        OPEN,
        EVIDENCE_SUBMITTED,
        RESOLVED,
        ESCALATED,
        CLOSED
    }

    enum Resolution {
        USER_WINS,
        AGENT_WINS,
        SPLIT,
        ESCALATED
    }

    struct Dispute {
        uint256 taskId;
        address raiser;
        string reason;
        string evidence;
        DisputeStatus status;
        Resolution resolution;
        uint256 slashAmount;
        uint256 createdAt;
        uint256 resolvedAt;
    }

    struct Evidence {
        address submitter;
        string content;
        uint256 timestamp;
    }

    mapping(uint256 => Dispute) public disputes;
    mapping(uint256 => Evidence[]) public disputeEvidence;
    mapping(uint256 => address[]) public disputeVoters;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256[]) public userDisputes;

    uint256 public nextDisputeId;
    uint256 public slashPercentage = 2500; // 25%
    uint256 public votingPeriod = 3 days;
    uint256 public minVoters = 3;

    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed taskId,
        address indexed raiser,
        string reason
    );
    event EvidenceSubmitted(
        uint256 indexed disputeId,
        address indexed submitter,
        string evidence
    );
    event DisputeResolved(
        uint256 indexed disputeId,
        Resolution resolution,
        uint256 slashAmount
    );
    event DisputeEscalated(uint256 indexed disputeId);
    event VoteCast(
        uint256 indexed disputeId,
        address indexed voter,
        bool voteInFavorOfUser
    );

    constructor() Ownable() {
        nextDisputeId = 1;
    }

    function createDispute(
        uint256 taskId,
        string calldata reason
    ) external returns (uint256 disputeId) {
        require(bytes(reason).length > 0, "Reason required");

        disputeId = nextDisputeId++;
        Dispute storage dispute = disputes[disputeId];

        dispute.taskId = taskId;
        dispute.raiser = msg.sender;
        dispute.reason = reason;
        dispute.status = DisputeStatus.OPEN;
        dispute.resolution = Resolution.ESCALATED;
        dispute.createdAt = block.timestamp;

        userDisputes[msg.sender].push(disputeId);

        emit DisputeCreated(disputeId, taskId, msg.sender, reason);
    }

    function submitEvidence(
        uint256 disputeId,
        string calldata evidence
    ) external {
        require(disputeId > 0 && disputeId < nextDisputeId, "Invalid ID");
        require(bytes(evidence).length > 0, "Evidence required");

        Dispute storage dispute = disputes[disputeId];
        require(
            dispute.status == DisputeStatus.OPEN ||
            dispute.status == DisputeStatus.EVIDENCE_SUBMITTED,
            "Cannot submit evidence"
        );

        disputeEvidence[disputeId].push(
            Evidence({
                submitter: msg.sender,
                content: evidence,
                timestamp: block.timestamp
            })
        );

        dispute.status = DisputeStatus.EVIDENCE_SUBMITTED;

        emit EvidenceSubmitted(disputeId, msg.sender, evidence);
    }

    function resolveDispute(
        uint256 disputeId,
        Resolution resolution,
        uint256 slashAmount
    ) external onlyOwner {
        require(disputeId > 0 && disputeId < nextDisputeId, "Invalid ID");

        Dispute storage dispute = disputes[disputeId];
        require(
            dispute.status != DisputeStatus.RESOLVED &&
            dispute.status != DisputeStatus.CLOSED,
            "Already resolved"
        );

        require(
            resolution != Resolution.ESCALATED ||
            msg.sender == owner(),
            "Cannot escalate"
        );

        dispute.resolution = resolution;
        dispute.status = DisputeStatus.RESOLVED;
        dispute.slashAmount = slashAmount;
        dispute.resolvedAt = block.timestamp;

        emit DisputeResolved(disputeId, resolution, slashAmount);
    }

    function escalateToDAO(uint256 disputeId) external {
        require(disputeId > 0 && disputeId < nextDisputeId, "Invalid ID");

        Dispute storage dispute = disputes[disputeId];
        require(
            dispute.raiser == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        require(
            dispute.status == DisputeStatus.EVIDENCE_SUBMITTED,
            "Evidence not submitted"
        );

        dispute.status = DisputeStatus.ESCALATED;

        emit DisputeEscalated(disputeId);
    }

    function castVote(
        uint256 disputeId,
        bool voteInFavorOfUser
    ) external {
        require(disputeId > 0 && disputeId < nextDisputeId, "Invalid ID");
        
        Dispute storage dispute = disputes[disputeId];
        require(
            dispute.status == DisputeStatus.EVIDENCE_SUBMITTED ||
            dispute.status == DisputeStatus.OPEN,
            "Cannot vote"
        );
        require(!hasVoted[disputeId][msg.sender], "Already voted");

        hasVoted[disputeId][msg.sender] = true;
        disputeVoters[disputeId].push(msg.sender);

        emit VoteCast(disputeId, msgSender(), voteInFavorOfUser);
    }

    function closeDispute(uint256 disputeId) external onlyOwner {
        require(disputeId > 0 && disputeId < nextDisputeId, "Invalid ID");

        Dispute storage dispute = disputes[disputeId];
        require(
            dispute.status == DisputeStatus.RESOLVED,
            "Not resolved"
        );

        dispute.status = DisputeStatus.CLOSED;
    }

    function setSlashPercentage(uint256 percentage) external onlyOwner {
        require(percentage <= BASIS_POINTS, "Invalid percentage");
        slashPercentage = percentage;
    }

    function setVotingPeriod(uint256 period) external onlyOwner {
        require(period > 0, "Invalid period");
        votingPeriod = period;
    }

    function setMinVoters(uint256 min) external onlyOwner {
        require(min > 0, "Invalid min");
        minVoters = min;
    }

    function getDispute(
        uint256 disputeId
    )
        external
        view
        returns (
            uint256 taskId,
            address raiser,
            string memory reason,
            DisputeStatus status,
            Resolution resolution,
            uint256 slashAmount,
            uint256 createdAt
        )
    {
        Dispute memory dispute = disputes[disputeId];
        return (
            dispute.taskId,
            dispute.raiser,
            dispute.reason,
            dispute.status,
            dispute.resolution,
            dispute.slashAmount,
            dispute.createdAt
        );
    }

    function getEvidenceCount(
        uint256 disputeId
    ) external view returns (uint256) {
        return disputeEvidence[disputeId].length;
    }

    function getEvidence(
        uint256 disputeId,
        uint256 index
    ) external view returns (
        address submitter,
        string memory content,
        uint256 timestamp
    ) {
        Evidence memory evidence = disputeEvidence[disputeId][index];
        return (
            evidence.submitter,
            evidence.content,
            evidence.timestamp
        );
    }

    function getVoterCount(uint256 disputeId) external view returns (uint256) {
        return disputeVoters[disputeId].length;
    }

    function getUserDisputes(
        address user
    ) external view returns (uint256[] memory) {
        return userDisputes[user];
    }
}
