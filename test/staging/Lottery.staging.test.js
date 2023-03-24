const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { EventFragment } = require("ethers/lib/utils");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { devChains, networkConfig } = require("../../helper-hardhat-config");

devChains.includes(network.name)
    ? describe.skip
    :describe("Lottery unit tests", function(){
        let lottery, entranceFee, deployer;

        beforeEach(async function(){
            deployer=(await getNamedAccounts()).deployer;
            lottery=await ethers.getContract("Lottery", deployer);
            entranceFee=await lottery.getEntranceFee();
        });

        describe("Fulfill random words", function(){
            it("works with like chainlink keepers and chainlink vrf, we get a random winner", async ()=>{
                console.log("Setting up test");
                const startingTimeStamp=await lottery.getLastTimeStamp();
                const accounts=await ethers.getSigners();

                console.log("Setting up listner");
                await new Promise(async (resolve, reject) =>{
                    lottery.once("WinnerPicked", async ()=>{        // listner if the blockchain is moving really fast
                        console.log("Winner Picked event is fired");
                        try{
                            const recentWinner=await lottery.getRecentWinner();
                            const state=await lottery.getLotteryState();
                            const winnerEndingBalance=await accounts[0].getBalance();   // since only 1 account is in the lottery at testing 
                            const endingTimeStamp=await lottery.getLastTimeStamp();

                            await expect(lottery.getPlayer(0)).to.be.reverted;
                            assert.equal(recentWinner.toString(), accounts[0].address);
                            assert.equal(state,0);
                            assert.equal(
                                winnerEndingBalance.toString(),
                                winnerStartingBalance.add(entranceFee).toString()
                            );
                            assert(endingTimeStamp>startingTimeStamp);
                            resolve();
                        }
                        catch(e){
                            console.log(e);
                            reject(e);
                        }
                        });

                    console.log("Entering the lottery");
                    const tx=await lottery.enterLottery({value: entranceFee});
                    await tx.wait(1);

                    console.log("Time to wait...");
                    const winnerStartingBalance=await accounts[0].getBalance();
                    //a promise is resolved only when the listner is true (.once) 
                });
            })
        })
    });
    
                          
                    
