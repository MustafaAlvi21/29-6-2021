var abi = []
var address = "0x8Db8634aE77CC1eac5E66bcc2f346B9BFB747E08"; // contract adddress
var fs = [];
var contract = [];
var web3 = [];
var account = "";
alert("commonJs")
if (document.location.origin === 'http://localhost:7654') {
    var URL = "http://localhost:7654/";
} else if(document.location.origin === 'https://musto-marketplace.herokuapp.com/') {
    var URL = "https://musto-marketplace.herokuapp.com/";
} else {
    var URL = "https://colexion.io/";
}

alert(URL)

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


// // get searched Items and show in modal
// async function searchData() {
//     searchQuery = document.getElementById("itemsForSale").value;
//     var loading = new Loading({ loadingBgColor: 'rgb(77, 150, 223)', discription: 'Loading...' });
//     await fetch(`${URL}home/search?name=${searchQuery}`)
//         .then(response => response.json())
//         .then((result) => {
//             //console.log(result); 
//             document.getElementById("dataOfSearch").innerHTML = "";
//             result.data.forEach((item, i) => {
//                 console.log(item);
//                 let Token_Price = parseFloat(item.Token_Price);
//                 let _status = item.Status == "Instant_buy" ? "Instant buy" : item.Status;
//                 document.getElementById("dataOfSearch").innerHTML += `
//                     <div class="col-4 mb-3"> 
//                         <div class="card"> 
//                             <a href="/detail?id=${item._id}" class="d-flex">
//                             <div class="card-body text-center  text-light"> 
//                             <img src="https://ipfs.infura.io/ipfs/${item.URL}" class="watermark nft-img card-img-top" alt="img-${i}">
//                             <div class="nft-detail-bottom position-absolute bottom-0 end-0 w-100 p-3 nft-ct-border">
//                                 <h6 class="card-text text-start fw-light text-capitalize fst-italic"> ${item.Title} </h6>
//                                 <div class="row">
//                                 <div class="col fw-bold text-start"> <img src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" class="nft-icon" alt="Eth-logo">  &nbsp;  ${Token_Price}
//                                 </div>
//                                 <div class="col col fw-light text-capitalize"> ${_status}  </div>
//                                 </div>   
//                                 </div> 
//                             </div></a> 
//                         </div></div> `;
//             });
//             loading.out(); 
//         }).catch((err) => {
//             loading.out();
//             console.log(err);
//         });
//     return false;
// }
