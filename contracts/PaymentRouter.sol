// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PaymentRouter is Ownable, ReentrancyGuard {
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant PLATFORM_FEE = 500; // 5%

    enum PaymentStatus {
        LOCKED,
        RELEASED,
        REFUNDED,
        FAILED
    }

    struct Payment {
        uint256 taskId;
        address sender;
        address recipient;
        uint256 lockedAmount;
        uint256 releasedAmount;
        PaymentStatus status;
        uint256 createdAt;
        uint256 releasedAt;
    }

    mapping(bytes32 => Payment) public payments;
    mapping(uint256 => bytes32[]) public taskPayments;
    mapping(address => bytes32[]) public userPayments;

    bytes32[] public allPaymentIds;
    uint256 public totalVolume;

    event PaymentLocked(
        bytes32 indexed paymentId,
        uint256 indexed taskId,
        address indexed sender,
        uint256 amount
    );
    event PaymentReleased(
        bytes32 indexed paymentId,
        uint256 indexed taskId,
        address recipient,
        uint256 amount,
        uint256 platformFee
    );
    event PaymentRefunded(
        bytes32 indexed paymentId,
        uint256 indexed taskId,
        address indexed recipient,
        uint256 amount
    );
    event PaymentFailed(
        bytes32 indexed paymentId,
        uint256 indexed taskId,
        string reason
    );

    constructor() Ownable() {}

    function lockPayment(
        uint256 taskId,
        address recipient
    ) external payable nonReentrant returns (bytes32 paymentId) {
        require(msg.value > 0, "Amount required");
        require(recipient != address(0), "Invalid recipient");

        paymentId = keccak256(
            abi.encodePacked(taskId, msg.sender, block.timestamp)
        );

        require(
            payments[paymentId].lockedAmount == 0,
            "Payment exists"
        );

        Payment storage payment = payments[paymentId];
        payment.taskId = taskId;
        payment.sender = msg.sender;
        payment.recipient = recipient;
        payment.lockedAmount = msg.value;
        payment.releasedAmount = 0;
        payment.status = PaymentStatus.LOCKED;
        payment.createdAt = block.timestamp;

        allPaymentIds.push(paymentId);
        taskPayments[taskId].push(paymentId);
        userPayments[msg.sender].push(paymentId);

        totalVolume += msg.value;

        emit PaymentLocked(paymentId, taskId, msg.sender, msg.value);
    }

    function releasePayment(
        bytes32 paymentId,
        uint256[] calldata agentIds,
        uint256[] calldata amounts
    ) external onlyOwner nonReentrant {
        require(agentIds.length == amounts.length, "Length mismatch");

        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.LOCKED,
            "Not locked"
        );

        uint256 totalToRelease;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalToRelease += amounts[i];
        }
        require(
            totalToRelease <= payment.lockedAmount,
            "Exceeds locked"
        );

        uint256 platformFee = (totalToRelease * PLATFORM_FEE) / BASIS_POINTS;
        uint256 agentsTotal = totalToRelease - platformFee;

        for (uint256 i = 0; i < agentIds.length; i++) {
            if (amounts[i] > 0) {
                (bool success, ) = owner().call{value: amounts[i]}("");
            }
        }

        if (platformFee > 0) {
            (bool feeSuccess, ) = owner().call{value: platformFee}("");
        }

        payment.releasedAmount = totalToRelease;
        payment.status = PaymentStatus.RELEASED;
        payment.releasedAt = block.timestamp;

        emit PaymentReleased(
            paymentId,
            payment.taskId,
            payment.recipient,
            agentsTotal,
            platformFee
        );
    }

    function releasePartial(
        bytes32 paymentId,
        address recipient,
        uint256 amount
    ) external onlyOwner nonReentrant {
        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.LOCKED,
            "Not locked"
        );
        require(
            amount <= payment.lockedAmount - payment.releasedAmount,
            "Exceeds available"
        );

        (bool success, ) = recipient.call{value: amount}("");
        
        payment.releasedAmount += amount;

        if (payment.releasedAmount >= payment.lockedAmount) {
            payment.status = PaymentStatus.RELEASED;
            payment.releasedAt = block.timestamp;
        }

        emit PaymentReleased(
            paymentId,
            payment.taskId,
            recipient,
            amount,
            0
        );
    }

    function refundPayment(bytes32 paymentId) external onlyOwner nonReentrant {
        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.LOCKED,
            "Not locked"
        );

        uint256 refundAmount = payment.lockedAmount - payment.releasedAmount;
        require(refundAmount > 0, "No funds to refund");

        (bool success, ) = payment.sender.call{value: refundAmount}("");
        
        payment.status = PaymentStatus.REFUNDED;
        payment.releasedAt = block.timestamp;

        emit PaymentRefunded(
            paymentId,
            payment.taskId,
            payment.sender,
            refundAmount
        );
    }

    function failPayment(
        bytes32 paymentId,
        string calldata reason
    ) external onlyOwner {
        Payment storage payment = payments[paymentId];
        require(
            payment.status == PaymentStatus.LOCKED,
            "Not locked"
        );

        payment.status = PaymentStatus.FAILED;

        emit PaymentFailed(paymentId, payment.taskId, reason);
    }

    function getPaymentStatus(
        bytes32 paymentId
    )
        external
        view
        returns (
            uint8 status,
            uint256 lockedAmount,
            uint256 releasedAmount
        )
    {
        Payment memory payment = payments[paymentId];
        return (
            uint8(payment.status),
            payment.lockedAmount,
            payment.releasedAmount
        );
    }

    function getTaskPaymentIds(
        uint256 taskId
    ) external view returns (bytes32[] memory) {
        return taskPayments[taskId];
    }

    function getUserPaymentIds(
        address user
    ) external view returns (bytes32[] memory) {
        return userPayments[user];
    }

    function getPaymentCount() external view returns (uint256) {
        return allPaymentIds.length;
    }

    receive() external payable {}
}
