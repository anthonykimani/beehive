const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentRegistry", function () {
  let agentRegistry;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();
    [owner, user1, user2] = await ethers.getSigners();
  });

  describe("registerAgent", function () {
    it("should register a new agent", async function () {
      const tx = await agentRegistry.registerAgent(
        "TestAgent",
        "https://metadata.example.com/1",
        [ethers.id("capability1")],
        0,
        ethers.parseEther("1")
      );
      const receipt = await tx.wait();

      const agentId = receipt.logs[0].args.agentId;
      const agent = await agentRegistry.getAgent(agentId);

      expect(agent.owner).to.equal(owner.address);
      expect(agent.name).to.equal("TestAgent");
      expect(agent.isActive).to.equal(true);
    });

    it("should increment agent ID correctly", async function () {
      await agentRegistry.registerAgent(
        "Agent1",
        "https://metadata.example.com/1",
        [],
        0,
        ethers.parseEther("1")
      );

      await agentRegistry.connect(user1).registerAgent(
        "Agent2",
        "https://metadata.example.com/2",
        [],
        0,
        ethers.parseEther("2")
      );

      const count = await agentRegistry.getAgentCount();
      expect(count).to.equal(2);
    });
  });

  describe("stake", function () {
    it("should allow staking on agent", async function () {
      await agentRegistry.registerAgent(
        "TestAgent",
        "https://metadata.example.com/1",
        [],
        0,
        ethers.parseEther("1")
      );

      const stakeAmount = ethers.parseEther("1");
      await agentRegistry.stake(1, { value: stakeAmount });

      const agent = await agentRegistry.getAgent(1);
      expect(agent.stakeAmount).to.equal(stakeAmount);
    });

    it("should fail if non-owner tries to stake", async function () {
      await agentRegistry.registerAgent(
        "TestAgent",
        "https://metadata.example.com/1",
        [],
        0,
        ethers.parseEther("1")
      );

      await expect(
        agentRegistry.connect(user1).stake(1, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("slash", function () {
    it("should slash agent stake", async function () {
      await agentRegistry.registerAgent(
        "TestAgent",
        "https://metadata.example.com/1",
        [],
        0,
        ethers.parseEther("1")
      );

      await agentRegistry.stake(1, { value: ethers.parseEther("10") });

      await agentRegistry.slash(1, ethers.parseEther("5"));

      const agent = await agentRegistry.getAgent(1);
      expect(agent.stakeAmount).to.equal(ethers.parseEther("5"));
    });
  });
});
