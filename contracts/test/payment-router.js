const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PaymentRouter", function () {
  let paymentRouter;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    const PaymentRouter = await ethers.getContractFactory("PaymentRouter");
    paymentRouter = await PaymentRouter.deploy();
    [owner, user1, user2] = await ethers.getSigners();
  });

  describe("lockPayment", function () {
    it("should lock payment", async function () {
      const amount = ethers.parseEther("1");
      
      const tx = await paymentRouter.connect(user1).lockPayment(1, user2.address, { value: amount });
      const receipt = await tx.wait();

      const paymentId = receipt.logs[0].args.paymentId;
      const payment = await paymentRouter.getPaymentStatus(paymentId);

      expect(payment.lockedAmount).to.equal(amount);
      expect(payment.status).to.equal(0); // Locked
    });

    it("should fail with zero amount", async function () {
      await expect(
        paymentRouter.connect(user1).lockPayment(1, user2.address, { value: 0 })
      ).to.be.revertedWith("Amount required");
    });
  });

  describe("releasePayment", function () {
    it("should release payment", async function () {
      const amount = ethers.parseEther("1");
      
      const tx = await paymentRouter.connect(user1).lockPayment(1, user2.address, { value: amount });
      const receipt = await tx.wait();
      const paymentId = receipt.logs[0].args.paymentId;

      await paymentRouter.releasePayment(paymentId, [user2.address], [ethers.parseEther("0.95")]);

      const payment = await paymentRouter.getPaymentStatus(paymentId);
      
      expect(payment.status).to.equal(1); // Released
    });
  });

  describe("refundPayment", function () {
    it("should refund payment", async function () {
      const amount = ethers.parseEther("1");
      
      const tx = await paymentRouter.connect(user1).lockPayment(1, user2.address, { value: amount });
      const receipt = await tx.wait();
      const paymentId = receipt.logs[0].args.paymentId;

      await paymentRouter.refundPayment(paymentId);

      const payment = await paymentRouter.getPaymentStatus(paymentId);
      
      expect(payment.status).to.equal(2); // Refunded
    });
  });
});
