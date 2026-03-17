// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract ReputationOracle is Ownable, ReentrancyGuard {
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant WEIGHT_RECENT_TASKS = 70;
    uint256 public constant WEIGHT_STAKE = 20;
    uint256 public constant WEIGHT_RATING = 10;

    struct AgentReputation {
        uint256 currentScore;
        uint256 totalTasksCompleted;
        uint256 totalTasksFailed;
        uint256 averageRating;
        uint256 lastUpdated;
        uint256[] historicalScores;
    }

    struct TaskRecord {
        bool completed;
        uint8 rating;
        uint256 timestamp;
        bool slashingEvent;
    }

    mapping(uint256 => AgentReputation) public agentReputations;
    mapping(uint256 => TaskRecord[]) public taskHistory;
    mapping(uint256 => uint256) public slashCounts;
    mapping(address => bool) public authorizedUpdaters;

    uint256 public scoreUpdateInterval = 1 days;

    event ScoreUpdated(
        uint256 indexed agentId,
        uint256 newScore,
        uint256 tasksCompleted,
        uint256 averageRating
    );
    event TaskRecorded(
        uint256 indexed agentId,
        uint256 indexed taskId,
        bool completed,
        uint8 rating
    );
    event AgentSlashed(
        uint256 indexed agentId,
        uint256 slashAmount,
        string reason
    );
    event UpdaterAuthorized(address updater, bool authorized);

    constructor() Ownable() {
        authorizedUpdaters[owner()] = true;
    }

    modifier onlyUpdater() {
        require(
            authorizedUpdaters[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    function setUpdater(address updater, bool authorized) external onlyOwner {
        authorizedUpdaters[updater] = authorized;
        emit UpdaterAuthorized(updater, authorized);
    }

    function setScoreUpdateInterval(uint256 interval) external onlyOwner {
        require(interval > 0, "Invalid interval");
        scoreUpdateInterval = interval;
    }

    function recordTask(
        uint256 agentId,
        uint256 taskId,
        bool completed,
        uint8 rating
    ) external onlyUpdater {
        require(rating <= 5, "Rating too high");
        
        TaskRecord memory record = TaskRecord({
            completed: completed,
            rating: completed ? rating : 0,
            timestamp: block.timestamp,
            slashingEvent: false
        });
        
        taskHistory[agentId].push(record);

        AgentReputation storage rep = agentReputations[agentId];
        
        if (completed) {
            rep.totalTasksCompleted++;
        } else {
            rep.totalTasksFailed++;
            rep.currentScore = rep.currentScore > 50 ? rep.currentScore - 50 : 0;
        }

        _recalculateScore(agentId);

        emit TaskRecorded(agentId, taskId, completed, rating);
    }

    function slashAgent(
        uint256 agentId,
        uint256 slashAmount,
        string calldata reason
    ) external onlyUpdater nonReentrant {
        require(slashAmount > 0 && slashAmount <= MAX_SCORE, "Invalid slash");
        
        AgentReputation storage rep = agentReputations[agentId];
        rep.currentScore = rep.currentScore > slashAmount 
            ? rep.currentScore - slashAmount 
            : 0;
        
        slashCounts[agentId]++;

        TaskRecord memory record = TaskRecord({
            completed: false,
            rating: 0,
            timestamp: block.timestamp,
            slashingEvent: true
        });
        taskHistory[agentId].push(record);

        emit AgentSlashed(agentId, slashAmount, reason);
    }

    function _recalculateScore(uint256 agentId) internal {
        AgentReputation storage rep = agentReputations[agentId];
        
        TaskRecord[] storage history = taskHistory[agentId];
        if (history.length == 0) return;

        uint256 totalRating;
        uint256 ratedTasks;
        uint256 recentCount;
        uint256 recentSum;
        
        uint256 cutoffTime = block.timestamp - (30 days);
        
        for (uint256 i = history.length > 100 ? history.length - 100 : 0; i < history.length; i++) {
            TaskRecord storage record = history[i];
            if (record.rating > 0) {
                totalRating += record.rating;
                ratedTasks++;
            }
            if (record.timestamp > cutoffTime && record.completed) {
                recentCount++;
                recentSum += record.rating;
            }
        }

        uint256 ratingScore = ratedTasks > 0 
            ? (totalRating * 100 * WEIGHT_RATING) / (ratedTasks * 5 * 100)
            : 0;
        
        uint256 recentScore = recentCount > 0 
            ? (recentSum * WEIGHT_RECENT_TASKS) / (recentCount * 5)
            : 0;

        uint256 newScore = ratingScore + recentScore;
        
        if (newScore > MAX_SCORE) newScore = MAX_SCORE;
        
        rep.currentScore = newScore;
        rep.averageRating = ratedTasks > 0 ? (totalRating * 100) / ratedTasks : 0;
        rep.lastUpdated = block.timestamp;
        rep.historicalScores.push(newScore);

        emit ScoreUpdated(
            agentId, 
            newScore, 
            rep.totalTasksCompleted, 
            rep.averageRating
        );
    }

    function calculateScore(uint256 agentId) external view returns (uint256) {
        AgentReputation memory rep = agentReputations[agentId];
        
        TaskRecord[] storage history = taskHistory[agentId];
        if (history.length == 0) return 0;

        uint256 totalRating;
        uint256 ratedTasks;
        
        for (uint256 i = history.length > 100 ? history.length - 100 : 0; i < history.length; i++) {
            if (history[i].rating > 0) {
                totalRating += history[i].rating;
                ratedTasks++;
            }
        }

        uint256 ratingScore = ratedTasks > 0 
            ? (totalRating * 100 * WEIGHT_RATING) / (ratedTasks * 5 * 100)
            : 0;

        return ratingScore;
    }

    function getHistoricalScore(
        uint256 agentId,
        uint256 index
    ) external view returns (uint256) {
        AgentReputation memory rep = agentReputations[agentId];
        require(index < rep.historicalScores.length, "Index out of bounds");
        return rep.historicalScores[index];
    }

    function getAgentReputation(
        uint256 agentId
    )
        external
        view
        returns (
            uint256 currentScore,
            uint256 totalTasksCompleted,
            uint256 totalTasksFailed,
            uint256 averageRating,
            uint256 slashCount
        )
    {
        AgentReputation memory rep = agentReputations[agentId];
        return (
            rep.currentScore,
            rep.totalTasksCompleted,
            rep.totalTasksFailed,
            rep.averageRating,
            slashCounts[agentId]
        );
    }

    function getTaskHistoryLength(uint256 agentId) external view returns (uint256) {
        return taskHistory[agentId].length;
    }
}
