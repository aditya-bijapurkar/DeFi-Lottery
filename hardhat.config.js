require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const GOERLI_RPC_URL=process.env.GOERLI_RPC_URL;
const GOERLI_PRIVATE_KEY=process.env.GOERLI_PRIVATE_KEY;
const COIN_MARKET_CAP_API_KEY=process.env.COIN_MARKET_CAP_API_KEY;
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1
    },
    goerli: {
      chainId: 5,
      blockConfirmations: 6,
      url: GOERLI_RPC_URL,
      accounts: [GOERLI_PRIVATE_KEY]
    }
  },
  gasReporter: {
    enabled: false,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: "USD",
    coinmarketcap: COIN_MARKET_CAP_API_KEY,
    token: "eth"
  },
  solidity: "0.8.18",
  
  namedAccounts:{
    deployer: {
      default: 0
    },
    player: {
      default: 1
    }
  },

  etherscan:{
    apiKey:{
      goerli: ETHERSCAN_API_KEY
    }
  }
};
