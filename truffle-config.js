
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
  },
  contracts_directory: './contracts/',
  contracts_build_directory: './build/abi network/',
  compilers: {
  solc: {
       version: "^0.5.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}

// -------------------------------------------------------------------------------------------------------------------------
// -------------------------------------------------------------------------------------------------------------------------

// // // const TEST_MNEMONIC = "short clay robust explain outdoor sausage until drum kingdom equal evolve hero";

// const HDWalletProvider = require("truffle-hdwallet-provider");
// const TEST_MNEMONIC = "arch rabbit daughter illness view pretty fine sponsor candy beauty lunar brisk";
// const projectId = "https://ropsten.infura.io/v3/9f65f2e7dc324b6fba99c874cecfbadd"

// module.exports = {
//   networks: {
//     ropsten: {
//       provider: function() {
//         return new HDWalletProvider(TEST_MNEMONIC, projectId)
//       },
//       gas: 7000000,        // Ropsten has a lower block limit than mainnet
//       network_id: 3,       // Ropsten's id
//     },
//     development: {
//       host: "127.0.0.1",
//       port: 7545,
//       network_id: "*" // Match any network id
//     },
//   },
//   contracts_directory: './contracts/',
//   contracts_build_directory: './build/abi network/',
//   compilers: {
//   solc: {
//        version: "^0.5.0",
//       optimizer: {
//         enabled: true,
//         runs: 200
//       }
//     }
//   }
// }
