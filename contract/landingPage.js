
$(document).ready(async function () {
  Nft = await fetch('/build/abi network/Nft.json')
    .then(response => response.json())
    .then(data => {
      return data;
    });

  // await loadWeb3()
  // await loadBlockchainData()
  //   await load_ItemForSale(1)
});

async function loadWeb3() {
  if (window.ethereum) {
    window.web3 = await new Web3(window.ethereum)
  }
  else if (window.web3) {
    window.web3 = await new Web3(window.web3.currentProvider)
  }
  else {
    toastr.error("Non-Ethereum browser detected. You should consider trying MetaMask!");
    //window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
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




//    Metamask connect kerne k liay code hay yay  -------------------------------//
// const ethereumButton = document.querySelector('#enableEthereumButton');
async function enableEthereumButton() {

  //   ethereumButton.addEventListener('click', async() => {

  if (typeof window.ethereum !== 'undefined') {
    // console.log('MetaMask is installed!');

    await loadWeb3()
    response = await loadBlockchainData()

    if (response) {

      ethereum.request({ method: 'eth_requestAccounts' }).then(async (result) => {
        result123 = await web3.eth.getAccounts()
        account = await web3.eth.getAccounts()
        await fetch(`${URL}login`, {
          method: 'POST', // or 'PUT'
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_wallet: result123[0] }),
        })
          .then(response => response.json())
          .then(async data => {

            if (data.error) {
              toastr.error(data.error);
              return false
            }

            toastr.success('Wallet Connected Successfully.');

            window.location.href = `${URL}home`
          })
          .catch((error) => {
            console.error('Error:', error);
          });

      }).catch((err) => {
        toastr.error("Metamask wallet connection rejected");
      });

    }

  } else {
    console.log('MetaMask is not installed!');
    toastr.error("MetaMask is not installed, unable to connect");
  }
  //   });
}