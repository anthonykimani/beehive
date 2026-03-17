const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ReputationOracle", function () {
  let reputationOracle;
  let owner;
  let updater;
  let user1;

  beforeEach(async function () {
    const ReputationOracle = await ethers.getContractFactory("ReputationOracle");
    reputationOracle = await ReputationOracle.deploy();
    [owner, updater, user1] = await ethers.getSigners();
    
    await reputationOracle.setUpdater(updater.address, true);
  });

  describe("recordTask", function () {
    it("should record completed task", async function () {
      await reputationOracle.recordTask(1, 1, true, 5);

      const rep = await reputationOracle.getAgentReputation(1);
      
      expect(rep.totalTasksCompleted).to.equal(1);
      expect(rep.totalTasksFailed).to.equal(0);
    });

    it("should record failed task", async function () {
      await reputationOracle.recordTask(1, 1, false, 0);

      const rep = await reputationOracle.getAgentReputation(1);
      
      expect(rep.totalTasksCompleted).to.equal(0);
      expect(rep.totalTasksFailed).to.equal(1);
    });

    it("should calculate average rating", async function () {
      await reputationOracle.recordTask(1, 1, true, 5);
      await reputationOracle.recordTask(1, 2, true, 3);

      const rep = await reputationOracle.getAgentReputation(1);
      
      expect(rep.averageRating).to.equal(400); // (5+3)/2 * 100
    });
  });

  describe("slashAgent", function () {
    it("should slash agent score", async function () {
      await reputationOracle.recordTask(1, 1, true, 5);
      
      await reputationOracle.slashAgent(1, 100, "Poor performance");

      const rep = await reputationOracle.getAgentReputation(1);
      
      expect(rep.currentScore).to.be.lt(1000);
      expect(rep.slashCount).to.equal(1);
    });
  });

  describe("calculateScore", function () {
    it("should calculate score", async function () {
      await reputationOracle.recordTask(1, 1, true, 5);
      await reputationOracle.recordTask(1, 2, true, 4);

      const score = await reputationOracle.calculateScore(1);
      
      expect(score).to.be.gt(0);
    });
  });
});
