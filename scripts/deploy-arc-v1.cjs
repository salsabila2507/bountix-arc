const hre = require("hardhat");

const ARC_CHAIN_ID = 5042002n;

function requireAddress(name) {
  const value = process.env[name];
  if (!value || !hre.ethers.isAddress(value) || value === hre.ethers.ZeroAddress) {
    throw new Error(`Set ${name} to a non-zero address before deploying V1.`);
  }
  return value;
}

function optionalAddress(name, fallback) {
  const value = process.env[name];
  if (!value) return fallback;
  if (!hre.ethers.isAddress(value) || value === hre.ethers.ZeroAddress) {
    throw new Error(`${name} must be a non-zero address when set.`);
  }
  return value;
}

async function main() {
  const net = await hre.ethers.provider.getNetwork();
  if (net.chainId !== ARC_CHAIN_ID) {
    throw new Error(`Refusing to deploy: expected ARC Testnet (5042002), got chainId ${net.chainId}`);
  }

  console.log("Deploying BountixEscrowV1 to ARC Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No signer configured. Set PRIVATE_KEY in .env before deploying.");
  }

  const usdcAddress = requireAddress("ARC_USDC_ADDRESS");
  const resolverAddress = optionalAddress("ARC_V1_RESOLVER_ADDRESS", deployer.address);
  const treasuryAddress = requireAddress("ARC_V1_TREASURY_ADDRESS");

  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ARC\n");

  console.log("Constructor parameters:");
  console.log("- USDC address:    ", usdcAddress);
  console.log("- Initial resolver:", resolverAddress);
  console.log("- Treasury:        ", treasuryAddress);
  console.log("- Default fee bps: 250");
  console.log("- Max fee bps:     1000\n");

  const BountixEscrowV1 = await hre.ethers.getContractFactory("BountixEscrowV1");

  console.log("Estimating deployment gas...");
  const deployTx = await BountixEscrowV1.getDeployTransaction(
    usdcAddress,
    resolverAddress,
    treasuryAddress,
  );
  const estimatedGas = await hre.ethers.provider.estimateGas(deployTx);
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || feeData.maxFeePerGas;
  if (!gasPrice) throw new Error("Unable to determine gas price.");
  const estimatedCost = estimatedGas * gasPrice;

  console.log("Estimated gas: ", estimatedGas.toString());
  console.log("Gas price:     ", hre.ethers.formatUnits(gasPrice, "gwei"), "gwei");
  console.log("Estimated cost:", hre.ethers.formatEther(estimatedCost), "ARC\n");

  if (balance < estimatedCost) {
    throw new Error(
      `Insufficient ARC: balance ${hre.ethers.formatEther(balance)} < estimated cost ${hre.ethers.formatEther(estimatedCost)}`
    );
  }

  console.log("Deploying contract...");
  const escrow = await BountixEscrowV1.deploy(
    usdcAddress,
    resolverAddress,
    treasuryAddress,
  );
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
  console.log("- Total cost:", hre.ethers.formatEther(actualCost), "ARC");

  console.log("\nContract config:");
  console.log("- feeBps:    ", (await escrow.feeBps()).toString());
  console.log("- maxFeeBps: ", (await escrow.MAX_FEE_BPS()).toString());
  console.log("- treasury:  ", await escrow.treasury());
  console.log("- resolver:  ", await escrow.resolver());

  console.log("\n=== RECORD THIS ===");
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("Tx hash: ", deploymentTx.hash);
  console.log("ArcScan: ", `https://testnet.arcscan.app/address/${contractAddress}`);
  console.log("===================\n");

  console.log("Optional verify command:");
  console.log(
    "npx hardhat verify --network arcTestnet",
    contractAddress,
    usdcAddress,
    resolverAddress,
    treasuryAddress,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
