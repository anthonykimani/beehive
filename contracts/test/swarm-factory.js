const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SwarmAgreementFactory", function () {
  let factory;
  let agentRegistry;
  let owner;
  let user1;

  beforeEach(async function () {
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();
    
    const SwarmAgreementFactory = await ethers.getContractFactory("SwarmAgreementFactory");
    factory = await SwarmAgreementFactory.deploy(agentRegistry.getAddress());
    
    [owner, user1] = await ethers.getSigners();
  });

  describe("createAgreement", function () {
    it("should create a new agreement", async function () {
      const agentIds = [1, 2];
      const agentShares = [5000, 5000]; // 50% each
      const taskDescriptions = ["Task 1", "Task 2"];
      const value = ethers.parseEther("1");

      const tx = await factory.createAgreement(
        agentIds,
        agentShares,
        0,
        taskDescriptions,
        { value }
      );
      const receipt = await tx.wait();

      const agreementId = 1;
      const agreement = await factory.getAgreement(agreementId);

      expect(agreement.creator).to.equal(owner.address);
      expect(agreement.totalValue).to.equal(value);
      expect(agreement.status).to.equal(1); // Active
    });

    it("should fail if shares don't equal 100%", async function () {
      const agentIds = [1, 2];
      const agentShares = [3000, 3000]; // 60% total
      const taskDescriptions = ["Task 1"];

      await expect(
        factory.createAgreement(
          agentIds,
          agentShares,
          0,
          taskDescriptions,
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("Shares must equal 100%");
    });

    it("should fail with no agents", async function () {
      await expect(
        factory.createAgreement(
          [],
          [],
          0,
          [],
          { value: ethers.parseEther("1") }
        )
      ).to.be.revertedWith("No agents");
    });
  });

  describe("cancelAgreement", function () {
    it("should allow creator to cancel", async function () {
      const agentIds = [1];
      const agentShares = [10000];
      const taskDescriptions = ["Task 1"];

      await factory.createAgreement(
        agentIds,
        agentShares,
        0,
        taskDescriptions,
        { value: ethers.parseEther("1") }
      );

      await factory.cancelAgreement(1);

      const agreement = await factory.getAgreement(1);
      expect(agreement.status).to.equal(4); // Cancelled
    });
  });

  describe("raiseDispute", function () {
    it("should allow raising a dispute", async function () {
      const agentIds = [1];
      const agentShares = [10000];
      const taskDescriptions = ["Task 1"];

      await factory.createAgreement(
        agentIds,
        agentShares,
        0,
        taskDescriptions,
        { value: ethers.parseEther("1") }
      );

      await factory.raiseDispute(1, "Task not completed properly");

      const agreement = await factory.getAgreement(1);
      expect(agreement.status).to.equal(3); // Disputed
    });
  });
});
