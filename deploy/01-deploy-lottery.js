const { network, ethers } = require("hardhat");
const { devChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const VRF_SUB_FUND_AMT=ethers.utils.parseEther("2");

module.exports= async function({getNamedAccounts, deployments}){
    const {deploy, log}=deployments;
    const {deployer}=await getNamedAccounts();
    const chainId=network.config.chainId;

    let vrfCoordinatorV2Address, subscriptionId;

    if(devChains.includes(network.name)){
        const vrfCoordinatorV2Mock=await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address=vrfCoordinatorV2Mock.address;
        const transactionResponce=await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt=await transactionResponce.wait(1);
        subscriptionId=transactionReceipt.events[0].args.subId;


        // on a real network we will need a link token
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_SUB_FUND_AMT);
    }
    else{
        vrfCoordinatorV2Address=networkConfig[chainId]["vrfCoordinatorV2"];
        subscriptionId=networkConfig[chainId]["subscriptionId"];
    }

    const entranceFee=networkConfig[chainId]["entranceFee"];
    const gasLane=networkConfig[chainId]["gasLane"];
    const callbackGasLimit=networkConfig[chainId]["callbackGasLimit"];
    const interval=networkConfig[chainId]["interval"];

    // constructor parameters of Lottery.sol
    const args=[vrfCoordinatorV2Address, subscriptionId, gasLane, interval, entranceFee, callbackGasLimit];
    const lottery = await deploy("Lottery",{
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    });

    if(!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        log("verifying....");
        await verify(lottery.address,args);
    }
    log("--------------------------------");
}

module.exports.tags=["all","lottery"];