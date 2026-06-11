const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const ONE_USDC = 1_000_000n;
const DEFAULT_FEE_BPS = 250n;
const MAX_FEE_BPS = 1_000n;
const TASK_ID = ethers.id("v2-fcfs-1");
const TASK_ID_2 = ethers.id("v2-fcfs-2");

function usdc(amount) {
  return BigInt(amount) * ONE_USDC;
}

function feeFor(amount, feeBps = DEFAULT_FEE_BPS) {
  return (amount * feeBps) / 10_000n;
}

describe("BountixEscrowV2", function () {
  async function deployFixture() {
    const [
      owner,
      resolver,
      treasury,
      treasury2,
      payer,
      winner1,
      winner2,
      winner3,
      outsider,
    ] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const token = await MockUSDC.deploy();
    await token.waitForDeployment();

    const Escrow = await ethers.getContractFactory("BountixEscrowV2");
    const escrow = await Escrow.deploy(
      await token.getAddress(),
      resolver.address,
      treasury.address,
    );
    await escrow.waitForDeployment();

    await token.mint(payer.address, usdc(1000));
    await token.connect(payer).approve(await escrow.getAddress(), usdc(1000));

    return {
      escrow,
      token,
      owner,
      resolver,
      treasury,
      treasury2,
      payer,
      winner1,
      winner2,
      winner3,
      outsider,
    };
  }

  async function fundFCFS(
    escrow,
    payer,
    budget = usdc(100),
    rewardPerWinner = usdc(10),
    maxWinners = 5,
    taskId = TASK_ID,
  ) {
    return escrow
      .connect(payer)
      .fundFCFSEscrow(taskId, budget, rewardPerWinner, maxWinners);
  }

  describe("deployment", function () {
    it("sets deployment config", async function () {
      const { escrow, token, owner, resolver, treasury } =
        await loadFixture(deployFixture);

      expect(await escrow.usdc()).to.equal(await token.getAddress());
      expect(await escrow.owner()).to.equal(owner.address);
      expect(await escrow.resolver()).to.equal(resolver.address);
      expect(await escrow.treasury()).to.equal(treasury.address);
      expect(await escrow.feeBps()).to.equal(DEFAULT_FEE_BPS);
      expect(await escrow.MIN_AMOUNT()).to.equal(ONE_USDC);
      expect(await escrow.MAX_FEE_BPS()).to.equal(MAX_FEE_BPS);
      expect(await escrow.DEFAULT_FEE_BPS()).to.equal(DEFAULT_FEE_BPS);
    });

    it("rejects invalid constructor config", async function () {
      const { token, resolver, treasury } = await loadFixture(deployFixture);
      const Escrow = await ethers.getContractFactory("BountixEscrowV2");

      await expect(
        Escrow.deploy(
          ethers.ZeroAddress,
          resolver.address,
          treasury.address,
        ),
      ).to.be.revertedWith("Invalid USDC address");
      await expect(
        Escrow.deploy(
          await token.getAddress(),
          ethers.ZeroAddress,
          treasury.address,
        ),
      ).to.be.revertedWith("Invalid resolver address");
      await expect(
        Escrow.deploy(
          await token.getAddress(),
          resolver.address,
          ethers.ZeroAddress,
        ),
      ).to.be.revertedWith("Invalid treasury address");
    });

    it("rejects native ETH", async function () {
      const { escrow, payer } = await loadFixture(deployFixture);

      await expect(
        payer.sendTransaction({
          to: await escrow.getAddress(),
          value: 1n,
        }),
      ).to.be.revertedWith("No ETH accepted");
    });
  });

  describe("FCFS escrow funding", function () {
    it("funds an FCFS escrow with correct state", async function () {
      const { escrow, token, payer } = await loadFixture(deployFixture);
      const budget = usdc(100);
      const reward = usdc(10);
      const maxWinners = 5n;

      await expect(
        escrow
          .connect(payer)
          .fundFCFSEscrow(TASK_ID, budget, reward, maxWinners),
      )
        .to.emit(escrow, "FCFSEscrowFunded")
        .withArgs(TASK_ID, payer.address, budget, reward, maxWinners);

      const stored = await escrow.getFCFSEscrow(TASK_ID);
      expect(stored.payer).to.equal(payer.address);
      expect(stored.budget).to.equal(budget);
      expect(stored.rewardPerWinner).to.equal(reward);
      expect(stored.maxWinners).to.equal(maxWinners);
      expect(stored.winnerCount).to.equal(0n);
      expect(stored.remainingBudget).to.equal(budget);
      expect(stored.state).to.equal(1n);
      expect(await token.balanceOf(await escrow.getAddress())).to.equal(
        budget,
      );
    });

    it("rejects budget below minimum", async function () {
      const { escrow, payer } = await loadFixture(deployFixture);
      await expect(
        escrow
          .connect(payer)
          .fundFCFSEscrow(TASK_ID, ONE_USDC - 1n, usdc(10), 5),
      ).to.be.revertedWith("Budget below minimum (1 USDC)");
    });

    it("rejects zero reward per winner", async function () {
      const { escrow, payer } = await loadFixture(deployFixture);
      await expect(
        escrow
          .connect(payer)
          .fundFCFSEscrow(TASK_ID, usdc(10), 0, 5),
      ).to.be.revertedWith("Invalid reward amount");
    });

    it("rejects zero max winners", async function () {
      const { escrow, payer } = await loadFixture(deployFixture);
      await expect(
        escrow
          .connect(payer)
          .fundFCFSEscrow(TASK_ID, usdc(10), usdc(10), 0),
      ).to.be.revertedWith("Invalid max winners");
    });

    it("rejects duplicate funding", async function () {
      const { escrow, payer } = await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);
      await expect(fundFCFS(escrow, payer)).to.be.revertedWith(
        "FCFS escrow already exists",
      );
    });

    it("allows multiple independent escrows with different taskIds", async function () {
      const { escrow, token, payer } = await loadFixture(deployFixture);
      await fundFCFS(escrow, payer, usdc(50), usdc(5), 3, TASK_ID);
      await fundFCFS(escrow, payer, usdc(30), usdc(3), 2, TASK_ID_2);

      const e1 = await escrow.getFCFSEscrow(TASK_ID);
      const e2 = await escrow.getFCFSEscrow(TASK_ID_2);
      expect(e1.budget).to.equal(usdc(50));
      expect(e2.budget).to.equal(usdc(30));
      expect(await token.balanceOf(await escrow.getAddress())).to.equal(
        usdc(80),
      );
    });
  });

  describe("claimReward (FCFS)", function () {
    it("lets a winner claim reward with fee deducted", async function () {
      const { escrow, token, treasury, payer, winner1 } =
        await loadFixture(deployFixture);
      const budget = usdc(100);
      const reward = usdc(10);
      const feeAmount = feeFor(reward);
      const netAmount = reward - feeAmount;

      await fundFCFS(escrow, payer, budget, reward, 5);

      await expect(escrow.connect(winner1).claimReward(TASK_ID))
        .to.emit(escrow, "WinnerClaimed")
        .withArgs(
          TASK_ID,
          winner1.address,
          reward,
          feeAmount,
          netAmount,
          budget - reward,
          1n,
        );

      expect(await token.balanceOf(winner1.address)).to.equal(netAmount);
      expect(await token.balanceOf(treasury.address)).to.equal(feeAmount);
      expect(await escrow.hasClaimed(TASK_ID, winner1.address)).to.be.true;
      expect((await escrow.getFCFSEscrow(TASK_ID)).winnerCount).to.equal(1n);
      expect((await escrow.getFCFSEscrow(TASK_ID)).remainingBudget).to.equal(
        budget - reward,
      );
    });

    it("prevents duplicate claims from same address", async function () {
      const { escrow, payer, winner1 } = await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);
      await escrow.connect(winner1).claimReward(TASK_ID);
      await expect(
        escrow.connect(winner1).claimReward(TASK_ID),
      ).to.be.revertedWith("Already claimed");
    });

    it("respects max winners cap", async function () {
      const { escrow, payer, winner1, winner2, winner3 } =
        await loadFixture(deployFixture);
      const maxWinners = 2n;

      await fundFCFS(escrow, payer, usdc(100), usdc(10), maxWinners);
      await escrow.connect(winner1).claimReward(TASK_ID);
      await escrow.connect(winner2).claimReward(TASK_ID);

      await expect(
        escrow.connect(winner3).claimReward(TASK_ID),
      ).to.be.revertedWith("Max winners reached");
    });

    it("stops when budget is insufficient for another reward", async function () {
      const { escrow, payer, winner1, winner2, winner3 } =
        await loadFixture(deployFixture);
      const budget = usdc(25);
      const reward = usdc(10);

      await fundFCFS(escrow, payer, budget, reward, 5);
      await escrow.connect(winner1).claimReward(TASK_ID);
      await escrow.connect(winner2).claimReward(TASK_ID);

      await expect(
        escrow.connect(winner3).claimReward(TASK_ID),
      ).to.be.revertedWith("Insufficient budget");
    });

    it("prevents claiming on a refunded escrow", async function () {
      const { escrow, owner, payer, winner1 } =
        await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);
      await escrow.connect(owner).refundFCFSEscrow(TASK_ID);
      await expect(
        escrow.connect(winner1).claimReward(TASK_ID),
      ).to.be.revertedWith("FCFS escrow not active");
    });

    it("prevents claiming from non-existent escrow", async function () {
      const { escrow, winner1 } = await loadFixture(deployFixture);
      await expect(
        escrow.connect(winner1).claimReward(TASK_ID),
      ).to.be.revertedWith("FCFS escrow not active");
    });
  });

  describe("payWinners (admin batch)", function () {
    it("admin can pay multiple winners in one call", async function () {
      const { escrow, token, treasury, owner, payer, winner1, winner2 } =
        await loadFixture(deployFixture);
      const budget = usdc(100);
      const reward = usdc(10);
      const feeAmount = feeFor(reward);
      const netAmount = reward - feeAmount;

      await fundFCFS(escrow, payer, budget, reward, 5);

      await expect(
        escrow.connect(owner).payWinners(TASK_ID, [
          winner1.address,
          winner2.address,
        ]),
      ).to.emit(escrow, "WinnerClaimed");

      expect(await token.balanceOf(winner1.address)).to.equal(netAmount);
      expect(await token.balanceOf(winner2.address)).to.equal(netAmount);
      expect(await token.balanceOf(treasury.address)).to.equal(feeAmount * 2n);
      expect(await escrow.hasClaimed(TASK_ID, winner1.address)).to.be.true;
      expect(await escrow.hasClaimed(TASK_ID, winner2.address)).to.be.true;
      expect((await escrow.getFCFSEscrow(TASK_ID)).winnerCount).to.equal(2n);
      expect((await escrow.getFCFSEscrow(TASK_ID)).remainingBudget).to.equal(
        budget - reward * 2n,
      );
    });

    it("reverts if any winner already claimed", async function () {
      const { escrow, resolver, payer, winner1, winner2 } =
        await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);
      await escrow.connect(winner1).claimReward(TASK_ID);

      await expect(
        escrow.connect(resolver).payWinners(TASK_ID, [
          winner1.address,
          winner2.address,
        ]),
      ).to.be.revertedWith("Already claimed");
    });

    it("reverts batch if non-admin caller", async function () {
      const { escrow, payer, winner1 } = await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);

      await expect(
        escrow.connect(winner1).payWinners(TASK_ID, [winner1.address]),
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("refund", function () {
    it("admin refunds full remaining budget to payer", async function () {
      const { escrow, token, owner, payer, winner1 } =
        await loadFixture(deployFixture);
      const budget = usdc(100);
      const reward = usdc(30);
      const before = await token.balanceOf(payer.address);

      await fundFCFS(escrow, payer, budget, reward, 5);
      await escrow.connect(winner1).claimReward(TASK_ID);

      const remainingAfterClaim = await (
        await escrow.getFCFSEscrow(TASK_ID)
      ).remainingBudget;

      await expect(escrow.connect(owner).refundFCFSEscrow(TASK_ID))
        .to.emit(escrow, "FCFSEscrowRefunded")
        .withArgs(TASK_ID, payer.address, remainingAfterClaim);

      expect(await token.balanceOf(payer.address)).to.equal(
        before - reward,
      );
      expect(
        (await escrow.getFCFSEscrow(TASK_ID)).state,
      ).to.equal(2n);
    });

    it("rejects refund from non-admin", async function () {
      const { escrow, payer, outsider } = await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);

      await expect(
        escrow.connect(outsider).refundFCFSEscrow(TASK_ID),
      ).to.be.revertedWith("Not authorized");
    });

    it("rejects double refund", async function () {
      const { escrow, owner, payer } = await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);
      await escrow.connect(owner).refundFCFSEscrow(TASK_ID);

      await expect(
        escrow.connect(owner).refundFCFSEscrow(TASK_ID),
      ).to.be.revertedWith("FCFS escrow not active");
    });

    it("refunds zero remaining when budget fully paid out", async function () {
      const { escrow, token, owner, payer, winner1 } =
        await loadFixture(deployFixture);
      const budget = usdc(10);
      const reward = usdc(10);

      await fundFCFS(escrow, payer, budget, reward, 1);
      await escrow.connect(winner1).claimReward(TASK_ID);

      const stored = await escrow.getFCFSEscrow(TASK_ID);
      expect(stored.remainingBudget).to.equal(0n);

      await expect(escrow.connect(owner).refundFCFSEscrow(TASK_ID))
        .to.emit(escrow, "FCFSEscrowRefunded")
        .withArgs(TASK_ID, payer.address, 0n);

      expect(await token.balanceOf(await escrow.getAddress())).to.equal(0n);
    });
  });

  describe("fee and treasury", function () {
    it("applies the default fee on each claim", async function () {
      const { escrow, token, treasury, payer, winner1, winner2 } =
        await loadFixture(deployFixture);
      const reward = usdc(100);
      const feeAmount = feeFor(reward);
      const netAmount = reward - feeAmount;

      await fundFCFS(escrow, payer, usdc(300), reward, 2);
      await escrow.connect(winner1).claimReward(TASK_ID);
      await escrow.connect(winner2).claimReward(TASK_ID);

      expect(await token.balanceOf(winner1.address)).to.equal(netAmount);
      expect(await token.balanceOf(winner2.address)).to.equal(netAmount);
      expect(await token.balanceOf(treasury.address)).to.equal(feeAmount * 2n);
    });

    it("applies the configured max fee cap", async function () {
      const { escrow, token, owner, treasury, payer, winner1 } =
        await loadFixture(deployFixture);
      await escrow.connect(owner).setFeeBps(MAX_FEE_BPS);

      const reward = usdc(100);
      const feeAmount = feeFor(reward, MAX_FEE_BPS);
      const netAmount = reward - feeAmount;

      await fundFCFS(escrow, payer, usdc(100), reward, 1);
      await escrow.connect(winner1).claimReward(TASK_ID);

      expect(await token.balanceOf(winner1.address)).to.equal(netAmount);
      expect(await token.balanceOf(treasury.address)).to.equal(feeAmount);
    });

    it("rounds fees down correctly", async function () {
      const { escrow, token, treasury, payer, winner1 } =
        await loadFixture(deployFixture);
      const reward = ONE_USDC + 1n;
      const feeAmount = feeFor(reward);
      const netAmount = reward - feeAmount;

      await fundFCFS(escrow, payer, usdc(10), reward, 1);
      await escrow.connect(winner1).claimReward(TASK_ID);

      expect(await token.balanceOf(winner1.address)).to.equal(netAmount);
      expect(await token.balanceOf(treasury.address)).to.equal(feeAmount);
      expect(feeAmount + netAmount).to.equal(reward);
    });
  });

  describe("configuration", function () {
    it("owner can set feeBps", async function () {
      const { escrow, owner } = await loadFixture(deployFixture);
      await expect(escrow.connect(owner).setFeeBps(500n))
        .to.emit(escrow, "FeeUpdated")
        .withArgs(DEFAULT_FEE_BPS, 500n);
      expect(await escrow.feeBps()).to.equal(500n);
    });

    it("rejects fee above max", async function () {
      const { escrow, owner } = await loadFixture(deployFixture);
      await expect(
        escrow.connect(owner).setFeeBps(MAX_FEE_BPS + 1n),
      ).to.be.revertedWith("Fee exceeds max");
    });

    it("owner can set treasury", async function () {
      const { escrow, owner, treasury, treasury2 } =
        await loadFixture(deployFixture);
      await expect(escrow.connect(owner).setTreasury(treasury2.address))
        .to.emit(escrow, "TreasuryUpdated")
        .withArgs(treasury.address, treasury2.address);
      expect(await escrow.treasury()).to.equal(treasury2.address);
    });

    it("rejects zero treasury", async function () {
      const { escrow, owner } = await loadFixture(deployFixture);
      await expect(
        escrow.connect(owner).setTreasury(ethers.ZeroAddress),
      ).to.be.revertedWith("Invalid treasury address");
    });

    it("owner can update resolver", async function () {
      const { escrow, owner, resolver, outsider } =
        await loadFixture(deployFixture);
      await expect(escrow.connect(owner).updateResolver(outsider.address))
        .to.emit(escrow, "ResolverUpdated")
        .withArgs(resolver.address, outsider.address);
      expect(await escrow.resolver()).to.equal(outsider.address);
    });

    it("keeps fee and treasury owner-only", async function () {
      const { escrow, resolver, treasury2 } =
        await loadFixture(deployFixture);
      await expect(
        escrow.connect(resolver).setFeeBps(0n),
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
      await expect(
        escrow.connect(resolver).setTreasury(treasury2.address),
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });
  });

  describe("access guards", function () {
    it("rejects non-admin from admin actions", async function () {
      const { escrow, owner, payer, winner1, treasury2, outsider } =
        await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);

      await expect(
        escrow.connect(outsider).payWinners(TASK_ID, [winner1.address]),
      ).to.be.revertedWith("Not authorized");

      await expect(
        escrow.connect(outsider).refundFCFSEscrow(TASK_ID),
      ).to.be.revertedWith("Not authorized");

      await expect(
        escrow.connect(outsider).setTreasury(treasury2.address),
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");

      await expect(
        escrow.connect(outsider).setFeeBps(0n),
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });

    it("resolver can pay winners and refund", async function () {
      const { escrow, resolver, payer, winner1 } =
        await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);

      await expect(
        escrow.connect(resolver).payWinners(TASK_ID, [winner1.address]),
      ).to.not.be.reverted;

      await expect(
        escrow.connect(resolver).refundFCFSEscrow(TASK_ID),
      ).to.not.be.reverted;
    });

    it("payer cannot access admin functions on their own escrow", async function () {
      const { escrow, payer, winner1 } = await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);

      await expect(
        escrow.connect(payer).payWinners(TASK_ID, [winner1.address]),
      ).to.be.revertedWith("Not authorized");

      await expect(
        escrow.connect(payer).refundFCFSEscrow(TASK_ID),
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("view functions", function () {
    it("hasClaimed returns correct values", async function () {
      const { escrow, payer, winner1, winner2 } =
        await loadFixture(deployFixture);
      await fundFCFS(escrow, payer);
      await escrow.connect(winner1).claimReward(TASK_ID);

      expect(await escrow.hasClaimed(TASK_ID, winner1.address)).to.be.true;
      expect(await escrow.hasClaimed(TASK_ID, winner2.address)).to.be.false;
    });

    it("getFCFSEscrow returns full struct", async function () {
      const { escrow, payer } = await loadFixture(deployFixture);
      const budget = usdc(50);
      const reward = usdc(5);
      const maxWinners = 3n;

      await fundFCFS(escrow, payer, budget, reward, maxWinners);
      const stored = await escrow.getFCFSEscrow(TASK_ID);

      expect(stored.payer).to.equal(payer.address);
      expect(stored.budget).to.equal(budget);
      expect(stored.rewardPerWinner).to.equal(reward);
      expect(stored.maxWinners).to.equal(maxWinners);
      expect(stored.winnerCount).to.equal(0n);
      expect(stored.remainingBudget).to.equal(budget);
      expect(stored.state).to.equal(1n);
    });
  });

  describe("repeated payouts tracking", function () {
    it("tracks remaining balance and winner count across multiple claims", async function () {
      const { escrow, payer, winner1, winner2, winner3 } =
        await loadFixture(deployFixture);
      const budget = usdc(100);
      const reward = usdc(20);

      await fundFCFS(escrow, payer, budget, reward, 5);

      await escrow.connect(winner1).claimReward(TASK_ID);
      let stored = await escrow.getFCFSEscrow(TASK_ID);
      expect(stored.remainingBudget).to.equal(budget - reward);
      expect(stored.winnerCount).to.equal(1n);

      await escrow.connect(winner2).claimReward(TASK_ID);
      stored = await escrow.getFCFSEscrow(TASK_ID);
      expect(stored.remainingBudget).to.equal(budget - reward * 2n);
      expect(stored.winnerCount).to.equal(2n);

      await escrow.connect(payer).fundFCFSEscrow(
        TASK_ID_2,
        budget,
        reward,
        5,
      );
      await escrow.connect(winner3).claimReward(TASK_ID_2);
      const stored2 = await escrow.getFCFSEscrow(TASK_ID_2);
      expect(stored2.remainingBudget).to.equal(budget - reward);
      expect(stored2.winnerCount).to.equal(1n);
    });
  });
});
