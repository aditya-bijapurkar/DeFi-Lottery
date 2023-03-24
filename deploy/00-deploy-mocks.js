const { network } = require("hardhat");
const { devChains } = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); // premium
const GAS_PRICE_LINK = 1e9; // calculated value on the gas price

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.chainId;

    if (devChains.includes(network.name)) {
        log("Local network detected! Deploying MOCKS....");
        // deploy a mock vrfcoordinator

        const args = [BASE_FEE, GAS_PRICE_LINK];
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        });
        log("Mocks Deployed");
        log("--------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
