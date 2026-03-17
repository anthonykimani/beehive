// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SwarmAgreementFactory is Ownable, ReentrancyGuard {
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PLATFORM_FEE = 500; // 5%

    enum ExecutionMode {
        SEQUENTIAL,
        PARALLEL
    }

    enum AgreementStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        DISPUTED,
        CANCELLED
    }

    struct Agreement {
        address creator;
        uint256[] agentIds;
        uint256[] agentShares;
        ExecutionMode executionMode;
        uint256 totalValue;
        uint256 paidAmount;
        AgreementStatus status;
        uint256 createdAt;
        uint256 completedAt;
    }

    struct Task {
        uint256 agreementId;
        string description;
        uint256 stepIndex;
        bool completed;
    }

    mapping(uint256 => Agreement) public agreements;
    mapping(uint256 => Task[]) public agreementTasks;
    mapping(uint256 => mapping(address => bool)) public hasDisputed;
    mapping(address => uint256[]) public creatorAgreements;

    uint256 public nextAgreementId;
    address public agentRegistry;
    address public paymentRouter;

    event AgreementCreated(
        uint256 indexed agreementId,
        address indexed creator,
        uint256[] agentIds,
        uint256 totalValue
    );
    event CompletionConfirmed(
        uint256 indexed agreementId,
        address indexed confirmer
    );
    event DisputeRaised(
        uint256 indexed agreementId,
        address indexed raiser,
        string reason
    );
    event DisputeResolved(
        uint256 indexed agreementId,
        bool userWins,
        uint256 slashAmount
    );
    event PaymentReleased(
        uint256 indexed agreementId,
        uint256 amount,
        uint256 platformFee
    );
    event AgreementCancelled(
        uint256 indexed agreementId,
        address indexed canceller
    );

    constructor(address _agentRegistry) Ownable() {
        require(_agentRegistry != address(0), "Invalid registry");
        agentRegistry = _agentRegistry;
        nextAgreementId = 1;
    }

    function setPaymentRouter(address _paymentRouter) external onlyOwner {
        require(_paymentRouter != address(0), "Invalid router");
        paymentRouter = _paymentRouter;
    }

    function createAgreement(
        uint256[] calldata agentIds,
        uint256[] calldata agentShares,
        ExecutionMode executionMode,
        string[] calldata taskDescriptions
    ) external payable returns (uint256 agreementId) {
        require(agentIds.length > 0, "No agents");
        require(agentIds.length == agentShares.length, "Length mismatch");
        require(msg.value > 0, "Value required");

        uint256 totalShares;
        for (uint256 i = 0; i < agentShares.length; i++) {
            totalShares += agentShares[i];
        }
        require(totalShares == BASIS_POINTS, "Shares must equal 100%");

        agreementId = nextAgreementId++;
        Agreement storage agreement = agreements[agreementId];

        agreement.creator = msg.sender;
        agreement.agentIds = agentIds;
        agreement.agentShares = agentShares;
        agreement.executionMode = executionMode;
        agreement.totalValue = msg.value;
        agreement.paidAmount = 0;
        agreement.status = AgreementStatus.ACTIVE;
        agreement.createdAt = block.timestamp;

        for (uint256 i = 0; i < taskDescriptions.length; i++) {
            agreementTasks[agreementId].push(
                Task({
                    agreementId: agreementId,
                    description: taskDescriptions[i],
                    stepIndex: i,
                    completed: false
                })
            );
        }

        creatorAgreements[msg.sender].push(agreementId);

        emit AgreementCreated(agreementId, msg.sender, agentIds, msg.value);
    }

    function confirmCompletion(uint256 agreementId) external nonReentrant {
        require(agreementId > 0 && agreementId < nextAgreementId, "Invalid ID");
        Agreement storage agreement = agreements[agreementId];
        
        require(
            agreement.creator == msg.sender || msg.sender == owner(),
            "Not authorized"
        );
        require(
            agreement.status == AgreementStatus.ACTIVE,
            "Not active"
        );

        uint256 platformFee = (agreement.totalValue * PLATFORM_FEE) / BASIS_POINTS;
        uint256 agentPayment = agreement.totalValue - platformFee;

        for (uint256 i = 0; i < agreement.agentIds.length; i++) {
            uint256 agentShare = (agentPayment * agreement.agentShares[i]) / BASIS_POINTS;
            
            (bool success, ) = owner().call{value: platformFee}("");
            platformFee = 0;

            emit PaymentReleased(agreementId, agentShare, platformFee);
        }

        agreement.status = AgreementStatus.COMPLETED;
        agreement.paidAmount = agreement.totalValue;
        agreement.completedAt = block.timestamp;

        emit CompletionConfirmed(agreementId, msg.sender);
    }

    function raiseDispute(
        uint256 agreementId,
        string calldata reason
    ) external {
        require(agreementId > 0 && agreementId < nextAgreementId, "Invalid ID");
        Agreement storage agreement = agreements[agreementId];
        
        require(
            agreement.creator == msg.sender,
            "Not creator"
        );
        require(
            agreement.status == AgreementStatus.ACTIVE,
            "Not active"
        );
        require(!hasDisputed[agreementId][msg.sender], "Already disputed");

        hasDisputed[agreementId][msg.sender] = true;
        agreement.status = AgreementStatus.DISPUTED;

        emit DisputeRaised(agreementId, msg.sender, reason);
    }

    function resolveDispute(
        uint256 agreementId,
        bool userWins,
        uint256 slashAmount
    ) external onlyOwner {
        require(agreementId > 0 && agreementId < nextAgreementId, "Invalid ID");
        Agreement storage agreement = agreements[agreementId];
        
        require(
            agreement.status == AgreementStatus.DISPUTED,
            "Not disputed"
        );

        if (userWins) {
            uint256 refund = agreement.totalValue - agreement.paidAmount;
            if (refund > 0) {
                payable(agreement.creator).transfer(refund);
            }
            agreement.status = AgreementStatus.CANCELLED;
        } else {
            agreement.status = AgreementStatus.COMPLETED;
            agreement.paidAmount = agreement.totalValue;
            agreement.completedAt = block.timestamp;
        }

        emit DisputeResolved(agreementId, userWins, slashAmount);
    }

    function cancelAgreement(uint256 agreementId) external nonReentrant {
        require(agreementId > 0 && agreementId < nextAgreementId, "Invalid ID");
        Agreement storage agreement = agreements[agreementId];
        
        require(agreement.creator == msg.sender || msg.sender == owner(), "Not authorized");
        require(agreement.status == AgreementStatus.ACTIVE, "Not active");
        require(agreement.paidAmount == 0, "Already paid");

        agreement.status = AgreementStatus.CANCELLED;
        
        payable(msg.sender).transfer(agreement.totalValue);

        emit AgreementCancelled(agreementId, msg.sender);
    }

    function getAgreement(
        uint256 agreementId
    )
        external
        view
        returns (
            address creator,
            uint256[] memory agentIds,
            uint256[] memory agentShares,
            uint8 executionMode,
            uint256 totalValue,
            uint256 paidAmount,
            uint8 status,
            uint256 createdAt
        )
    {
        require(agreementId > 0 && agreementId < nextAgreementId, "Invalid ID");
        Agreement memory agreement = agreements[agreementId];
        return (
            agreement.creator,
            agreement.agentIds,
            agreement.agentShares,
            uint8(agreement.executionMode),
            agreement.totalValue,
            agreement.paidAmount,
            uint8(agreement.status),
            agreement.createdAt
        );
    }

    function getTaskCount(uint256 agreementId) external view returns (uint256) {
        return agreementTasks[agreementId].length;
    }

    function getTasks(uint256 agreementId) external view returns (Task[] memory) {
        return agreementTasks[agreementId];
    }

    function getCreatorAgreements(
        address creator
    ) external view returns (uint256[] memory) {
        return creatorAgreements[creator];
    }
}
