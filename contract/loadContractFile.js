
$(document).ready(async function () {
  Nft = await fetch('/build/abi network/Nft.json')
    .then(response => response.json())
    .then(data => {
      return data;
    });

  await loadWeb3()
  // await loadBlockchainData()
  //   await load_ItemForSale(1)
});

async function loadWeb3() {
  // console.log(window.ethereum);
  if (window.ethereum) {
    window.web3 = await new Web3(window.ethereum)
    // await window.ethereum.enable().then((result) => {
    //   console.log(result);
    // }).catch((err) => {
    //   console.log(err);
    // });
  }
  else if (window.web3) {
    window.web3 = await new Web3(window.web3.currentProvider)
  }
  else {
    toastr.error("Non-Ethereum browser detected. You should consider trying MetaMask!");
  }
}


async function loadBlockchainData() {
  web3 = window.web3
  const networkId = await web3.eth.net.getId()
  const networkData = Nft.networks[networkId]
  if (networkData) {
    const abi = Nft.abi
    const address = networkData.address
    contract = await new web3.eth.Contract(abi, address)
    // console.log("contract");
    // console.log(contract);
    // itemsForSale(1)
  } else {
    toastr.error('Please switch to Ropsten Network.');
    // alert("Smart contract not deployed to detected network.")
    return false
  }

  return true;
}