const hre = require("hardhat");

// ARC Testnet USDC address.
const ARC_TESTNET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function main() {
  const net = await hre.ethers.provider.getNetwork();
  if (net.chainId !== 5042002n) {
    throw new Error(`Refusing to deploy: expected ARC Testnet (5042002), got chainId ${net.chainId}`);
  }

  console.log("Deploying BountixEscrowV0 to ARC Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Use deployer as the initial resolver; owner can change it later via updateResolver().
  const resolverAddress = deployer.address;

  console.log("Constructor parameters:");
  console.log("- USDC address:    ", ARC_TESTNET_USDC);
  console.log("- Initial resolver:", resolverAddress);
  console.log("");

  const BountixEscrowV0 = await hre.ethers.getContractFactory("BountixEscrowV0");

  // Estimate gas/cost and guard against insufficient balance before sending.
  console.log("Estimating deployment gas...");
  const deployTx = await BountixEscrowV0.getDeployTransaction(ARC_TESTNET_USDC, resolverAddress);
  const estimatedGas = await hre.ethers.provider.estimateGas(deployTx);
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;
  const estimatedCost = estimatedGas * gasPrice;

  console.log("Estimated gas: ", estimatedGas.toString());
  console.log("Gas price:     ", hre.ethers.formatUnits(gasPrice, "gwei"), "gwei");
  console.log("Estimated cost:", hre.ethers.formatEther(estimatedCost), "ETH\n");

  if (balance < estimatedCost) {
    throw new Error(
      `Insufficient ETH: balance ${hre.ethers.formatEther(balance)} < estimated cost ${hre.ethers.formatEther(estimatedCost)}`
    );
  }

  console.log("Deploying contract...");
  const escrow = await BountixEscrowV0.deploy(ARC_TESTNET_USDC, resolverAddress);
  await escrow.waitForDeployment();

  const contractAddress = await escrow.getAddress();
  const deploymentTx = escrow.deploymentTransaction();

  console.log("\nDeployment submitted!");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", deploymentTx.hash);

  console.log("\nWaiting for 3 confirmations...");
  const receipt = await deploymentTx.wait(3);
  console.log("Confirmed in block:", receipt.blockNumber);

  const actualGasUsed = receipt.gasUsed;
  const effGasPrice = receipt.gasPrice ?? receipt.effectiveGasPrice;
  const actualCost = actualGasUsed * effGasPrice;

  console.log("\nDeployment stats:");
  console.log("- Gas used: ", actualGasUsed.toString());
  console.log("- Gas price:", hre.ethers.formatUnits(effGasPrice, "gwei"), "gwei");
  console.log("- Total cost:", hre.ethers.formatEther(actualCost), "ETH");

  console.log("\n=== SAVE THIS ===");
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Tx hash: ", deploymentTx.hash);
  console.log("=================\n");

  console.log("Next steps:");
  console.log("1. Record the address + tx hash in docs/escrow-contract.md");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
