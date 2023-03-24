const { assert, expect } = require("chai");
const { EventFragment } = require("ethers/lib/utils");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { devChains, networkConfig } = require("../../helper-hardhat-config")

!devChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Test", function(){
        let lotteryContract, lottery, vrfCoordinatorV2Mock, entranceFee, interval, player;
        const chainId=network.config.chainId;

        beforeEach(async function(){
            accounts=await ethers.getSigners();     // same as getNamedAccounts()  -> returns accounts from (hardhat.config.js) -> namedAccounts

            const {deployer} = await getNamedAccounts();  //  ->accounts[0]
            player=accounts[1];
            await deployments.fixture(["all"]);     // fixture is used in testing to create a proper test environment

            
            lottery=await ethers.getContract("Lottery", deployer);
            // lottery=lotteryContract.connect(player);
            vrfCoordinatorV2Mock=await ethers.getContract("VRFCoordinatorV2Mock", deployer);

            entranceFee=await lottery.getEntranceFee();
            interval=await lottery.getInterval();
        });
        
        describe("constructor", function(){
            it("Initiallizes the lottery contract", async function(){
                const lotteryState=await lottery.getLotteryState();
                assert.equal(lotteryState.toString(), "0");

                assert.equal(interval.toString(), networkConfig[chainId]["interval"]);
            });
        });

        describe("Enter Lottery", () => {
            it("Reverts when less ETH is paid", async ()=>{
                await expect(lottery.enterLottery()).to.be.reverted;
            });

            it("records players when they enter", async ()=>{
                await lottery.enterLottery({value: entranceFee});
                const contractPlayer=await lottery.getPlayer(0);
                assert.equal(player.address,contractPlayer);            // contract is deployed with player, so player will make a transaction by default
            });

            it("emits event when entered", async ()=>{
                await expect(lottery.enterLottery({value: entranceFee})).to.emit(
                    lottery, "LotteryEnter"
                );
            });

            // it("doesn't allow to enter when lottery is in calculating state", async ()=>{
            //     await lottery.enterLottery({value: entranceFee});

            //     // pretend to be a chainlink keeper network so that we can keep calling checkUpkeep function
            //     // checkUpkeep needs to return true in order for performUpkeep to work
            //     await network.provider.send("evm_increaseTime", [interval.toNumber()+1]);
            //     await network.provider.request({method: "evm_mine", params: []});

            //     // we pretend to be a chainlink node
            //     await lottery.performUpkeep([]);
            //     await expect(lottery.enterLottery({ value: entranceFee })).to.be.reverted; // is reverted as lottery is calculating
            // });
        });
        describe("performUpkeep", function () {
            // it("can only run if checkupkeep is true", async () => {
            //     await lottery.enterLottery({ value: entranceFee })
            //     await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            //     await network.provider.request({ method: "evm_mine", params: [] })
            //     const tx = await lottery.performUpkeep("0x") 
            //     assert(tx)
            // })
            it("reverts if checkup is false", async () => {
                await expect(lottery.performUpkeep("0x")).to.be.reverted;
            })
            // it("updates the lottery state and emits a requestId", async () => {
            //     // Too many asserts in this test!
            //     await lottery.enterLottery({ value: entranceFee })
            //     await network.provider.send("evm_increaseTime", [interval.toNumber() + 1])
            //     await network.provider.request({ method: "evm_mine", params: [] })
            //     const txResponse = await lottery.performUpkeep("0x") // emits requestId
            //     const txReceipt = await txResponse.wait(1) // waits 1 block
            //     const lotteryState = await lottery.getLotteryState() // updates state
            //     const requestId = txReceipt.events[1].args.requestId
            //     assert(requestId.toNumber() > 0)
            //     assert(lotteryState == 1) // 0 = open, 1 = calculating
            // })
        })


        describe("Fulfill random words", function(){
            beforeEach(async ()=>{
                await lottery.enterLottery({value: entranceFee});
                await network.provider.send("evm_increaseTime", [interval.toNumber() + 1]);
                await network.provider.request({method: "evm_mine", params: []});
            });

            it("can only be called after performUpkeep", async ()=>{
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(0,lottery.address)).to.be.revertedWith("nonexistent request");
                await expect(vrfCoordinatorV2Mock.fulfillRandomWords(1,lottery.address)).to.be.revertedWith("nonexistent request");
            });

            // big one
            it("picks a winner, resets, sends money", async function(){
                const additionalEnterants=3;
                const startingIndex=1;      // 0th is deployer
            });
        });
    });