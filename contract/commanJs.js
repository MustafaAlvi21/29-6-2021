var abi = []
var address = "0xc61d199f1c857c472705ffff3c9bd06d63845667"; // contract adddress
var fs = [];
var contract = [];
var web3 = [];
var account = "";
// alert("commonJs")
if (document.location.origin === 'http://localhost:7654') {
    var URL = "http://localhost:7654/";
} else {
    var URL = "https://musto-marketplace.herokuapp.com/";
}

// alert(URL)

$(document).ready(async function () {
    abi = await fetch('/build/abi network/Nft.json')
      .then(response => response.json())
      .then(data => {
        return data;
      });
      await loadWeb3()
      await loadBlockchainData()
});

  

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = await new Web3(window.ethereum)
    }
    else if (window.web3) {
        window.web3 = await new Web3(window.web3.currentProvider)
    }
    else {
        toastr.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
}

//    Metamask connect kerne k liay code hay yay  -------------------------------//
var ethereumButton = document.querySelector('#enableEthereumButton');
if (ethereumButton) {
    ethereumButton.addEventListener('click', async () => {
        //Will Start the metamask extension
        if (typeof window.ethereum !== 'undefined') {
            // console.log('MetaMask is installed!');
            await loadWeb3()
            response = await loadBlockchainData();
            if (response) {
                ethereum.request({ method: 'eth_requestAccounts' }).then(async (result) => {
                    result123 = await web3.eth.getAccounts()
                    account = await web3.eth.getAccounts()
                    alert(account)
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
                            window.location.reload(true);
                            //window.location.href = `${URL}home`
                        })
                        .catch((error) => {
                            console.error('Error:', error);
                        });
                }).catch((err) => {
                    toastr.warning('Metamask wallet connection rejected.');
                    return false;
                });
            };
        } else {
            //console.log('MetaMask is not installed!');
            toastr.warning('MetaMask is not installed, unable to connect');
            //alert("MetaMask is not installed, unable to connect")
        }
    });
}


async function loadBlockchainData() {
    
    web3 = window.web3
    account = await web3.eth.getAccounts()
    account = account[0]
    const networkId = await web3.eth.net.getId()
    console.log("networkId");
    console.log(networkId); 
    // const networkData = Nft.networks[networkId]
    if (networkId == 3) {
        contract = await new web3.eth.Contract(abi, address)
        //console.log(contract); 
    } else {
        toastr.error('Please switch to correct Network');
        return false
    }
    return true;
}



function isFileImage(file) {
    //console.log(' file[type] :::: ', file['type']);
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    return file && acceptedImageTypes.includes(file['type'])
}