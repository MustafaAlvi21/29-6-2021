var address = "0x8Db8634aE77CC1eac5E66bcc2f346B9BFB747E08";

$(document).ready(async function () {
  abi = await fetch('/build/abi network/Nft.json')
    .then(response => response.json())
    .then(data => {
      return data;
    });
  await load_ItemForSale(1)
});



function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

async function load_ItemForSale(page) {
  let myvar = getURLParameter('cat');
  if (myvar !== null) {
    _GetFilterData(JSON.stringify({ "Category": [myvar] }), 1);
  } else {
    var loading = new Loading({ loadingBgColor: 'rgb(77, 150, 223)', discription: 'Loading...' });
    await fetch(`${URL}home/itemsForSale?page=${page}`, {
      method: 'GET'
    })
      .then(response => response.json())
      .then(async data => {
        totalSupply = data.totalSupply;
        const firstPage = 1
        const limit = data.limit
        const lastPage = Math.ceil(totalSupply / limit);
        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        account = await web3.eth.getAccounts().then((result) => {
          return result;
        }).catch((err) => {
          //console.log(err);
        });
        // if (typeof account != "undefined") {
        //   document.getElementById("CreateItemAccount").value = account[0];
        // }
        endIndexForLoop = endIndex > totalSupply ? endIndex - (endIndex - totalSupply) : endIndex
        document.getElementById("itemsForSale").innerHTML = "";
        for (var i = 0; i < data.results.length; i++) {
          let status = data.results[i].Status == "Instant_buy" ? "Instant buy" : data.results[i].Status;
          isFileImage(`https://ipfs.infura.io/ipfs/${data.results[i].thumb}`);
          //console.log('data.data[i].URL', data.results[i].URL);
          document.getElementById("itemsForSale").innerHTML += `
            <div class="col-4 mb-3"> 
              <div class="card pt-3"> 
                  <a href="/detail?id=${data.results[i]._id}" class="d-flex ms-auto me-auto">
                  <div class="card-body text-center  text-light p-0"> 
                  <img src="${data.results[i].thumb}" class="watermark nft-img card-img-top" alt="img-${i}">
                  <div class="nft-detail-bottom position-absolute bottom-0 end-0 w-100 p-3 nft-ct-border">
                      <h6 class="card-text text-start fw-light text-capitalize fst-italic"> ${data.results[i].Title} </h6>
                      <div class="row">
                        <div class="col fw-bold text-start"> <img src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" class="nft-icon" alt="Eth-logo">  &nbsp;  ${data.results[i].Token_Price}  
                        </div>
                        <div class="col col fw-light text-capitalize"> ${status}  </div>
                      </div>   
                      </div> 
                  </div></a> 
              </div></div>`;
        }
        document.getElementById("itemsForSale").innerHTML += `
          <div class="row w-100">
            <nav aria-label="Page navigation example" style="display: flex; justify-content: flex-end">
              <ul class="pagination" id="pagination"> </ul>
            </nav>
          </div>`

        if (typeof firstPage != "undefined" && totalSupply > limit) {
          document.getElementById("pagination").innerHTML += `
              <li class="page-item"><a class="page-link" onclick="load_ItemForSale(${firstPage})" href="#">First</a></li>
            `
        }

        if (typeof data.previous != "undefined" && totalSupply > (limit + limit)) {
          document.getElementById("pagination").innerHTML += `
              <li class="page-item"><a class="page-link" onclick="load_ItemForSale(${data.previous.page})" href="#">Previous</a></li>
            `
        }

        if (typeof data.next != "undefined" && totalSupply > (limit + limit)) {
          document.getElementById("pagination").innerHTML += `
              <li class="page-item"><a class="page-link" onclick="load_ItemForSale(${data.next.page})" href="#">Next</a></li>
            `
        }

        if (typeof lastPage != "undefined" && totalSupply > limit) {
          document.getElementById("pagination").innerHTML += `
              <li class="page-item"><a class="page-link" onclick="load_ItemForSale(${lastPage})" href="#">Last</a></li>
            `
        }
        loading.out();

      })
      .catch(err => {
        //console.log(err);
        loading.out();
      })
  }
}


async function getSessionUser() {
  logUser = await fetch(`${URL}login/getUser`)
    .then(response => response.json())
    .then(data => {
      //  console.log("data.userLogin")
      //  console.log(data.userLogin)
      return data.userLogin;
    })
    .catch((err) => {
      //console.log(err);
    });
  return logUser;
}

async function pinFileToIPFS(path) {

  account = await web3.eth.getAccounts()
  const networkId = await web3.eth.net.getId()
  // const networkData = Nft.networks[networkId]
  if (networkId == 3) {
    // const abi = Nft.abi
    // const address = networkData.address
    contract = await new web3.eth.Contract(abi, address)

    getSessionUser = await getSessionUser();

    if (account[0] == getSessionUser) {
      data = JSON.parse(path)
      data.account = account[0];

      // update status fron string format to Boolean
      _status = data.Status === "true" ? true : false;
      priceInEther = web3.utils.toWei(data.Price, 'ether');

      var loading = new Loading({ loadingBgColor: 'rgb(77, 150, 223)', discription: "Waiting for transaction confirmation, please don't close window it will take 1-2 minutes." });

      //console.log(data);
      contract.methods.mint(data.path, priceInEther, _status).send({ from: account[0] })
        .then(async (result) => {
          // console.log(result);
          //console.log(result.events.Transfer.returnValues.tokenId);

          data.tokenId = result.events.Transfer.returnValues.tokenId;
          status123 = JSON.parse(path)

          if (status123.Status == "Auctioned") {
            //alert("Auctioned")
            await saveToDatabase(data);

            Maximum_Bid_InWei = await web3.utils.toWei(data.Auction_maxBid, 'ether');
            Minimum_Bid_InWei = await web3.utils.toWei(data.Auction_minBid, 'ether');

            var loading = new Loading({ loadingBgColor: 'rgb(77, 150, 223)', discription: "Waiting for transaction confirmation, please don't close window it will take 1-2 minutes." });
            await contract.methods.nft((parseInt(data.tokenId))).call().then(async (result) => {
              a = result;
              if (a.Status == false) {
                await contract.methods.create_Auction(data.Auction_duration, data.tokenId, Minimum_Bid_InWei, Maximum_Bid_InWei).send({ from: account[0] })
                  .then(async (result) => {
                    await contract.methods.T_Auction((parseInt(data.tokenId))).call().then(async (result) => {
                      a = result;
                      await fetch(`${URL}update-token/Auction/${a.Token_id}/${data.Auction_duration}/${a.auction_owner}/${Date.now()}/${a.auction_win_bid}/${a.auction_winner}/${a.highestBid}/${a.highestBidder}/${data.Auction_maxBid}/${data.Auction_minBid}/${a.state}`)
                        .then(response => response.json())
                        .then(data => {
                          toastr.info('Status Updated');
                          location.href = `${URL}profile`
                          return data;
                        })
                        .catch(err => {
                          toastr.error(err);
                        });
                    })
                      .catch((err) => {
                        //console.log(err);
                      })
                  })
                  .catch((err) => {
                    //console.log(err);
                    toastr.error(err);
                  })
              } else {
                toastr.warning("Item is on sale, should be 'Not for sale', for make auction");
              };
              loading.out();
            })
              .catch((err) => {
                //console.log(err);
                loading.out();
              })
          } else {
            //alert("Not Auctioned")
            await saveToDatabase(data);
          }


          // loading.out();

          location.href = `${URL}profile`
        }).catch((err) => {
          //console.log(err);
          loading.out();
        });

    } else {
      document.getElementById("error_alert").style.display = "block"
      document.getElementById("error_alert_msg").innerText = "Re-login please or you have change your Metamask account."
    }

  } else {
    toastr.error('Please switch to valid Network.');
  }
}

async function saveToDatabase(params) {
  params.Status = params.Status == "true" ? "Instant_buy" : "Not for Sale";
  params.PriceInWei = parseFloat(params.Price) * 1000000000000000000;
  // alert("sdas")
  await fetch(`${URL}home/saveToData`, {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
    .then(response => response.json())
    .then(async data => {
      //console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  return true;
}

async function filter(page) {

  //  Categories
  const checkbox1 = document.getElementById("styled-checkbox-1");
  const checkbox2 = document.getElementById("styled-checkbox-2");
  const checkbox3 = document.getElementById("styled-checkbox-3");
  const checkbox4 = document.getElementById("styled-checkbox-4");
  // const checkbox5 = document.getElementById("styled-checkbox-5");
  // const checkbox6 = document.getElementById("styled-checkbox-6");
  // const checkbox7 = document.getElementById("styled-checkbox-7");
  const checkbox8 = document.getElementById("styled-checkbox-8");
  const checkbox9 = document.getElementById("styled-checkbox-9");
  const checkbox10 = document.getElementById("styled-checkbox-10");
  categoryList = localStorage.getItem("category");

  //checkbox5, checkbox6, checkbox7, 
  category123 = [checkbox1, checkbox2, checkbox3, checkbox4, checkbox8, checkbox9, checkbox10];
  selectedCategory = [];
  category123.forEach(element => {
    if (element.checked == true) {
      selectedCategory.push(element.value);
    }
  });

  sort_By = await asd111();

  query = {}
  if (selectedCategory.length > 0) {
    query.Category = selectedCategory
  }
  if (typeof sort_By != "undefined" && sort_By != "") {
    query.sort = sort_By.split(",")
  }

  if (Object.values(query).length == 0) {
    location.reload();
    return true
  }

  page = typeof page == "undefined" ? 1 : page;
  _GetFilterData(JSON.stringify(query), page);

}

async function _GetFilterData(query, page) {
  //console.log(query);
  var loading = new Loading({ loadingBgColor: 'rgb(77, 150, 223)', discription: 'Loading...' });
  await fetch(`${URL}home/filter/${query}?page=${page}`)
    .then(response => response.json())
    .then(async data => {
      loading.out();
      document.getElementById("itemsForSale").innerHTML = ""
      for (var i = 0; i < data.data.length; i++) {
        let Token_Price = parseFloat(data.data[i].Token_Price);

        document.getElementById("itemsForSale").innerHTML += `
        <div class="col-4 mb-3"> 
          <div class="card pt-3"> 
              <a href="/detail?id=${data.data[i]._id}" class="d-flex  ms-auto me-auto">
              <div class="card-body text-center  text-light p-0"> 
              <img src="${data.data[i].thumb}" class="watermark nft-img card-img-top" alt="img-${i}">
              <div class="nft-detail-bottom position-absolute bottom-0 end-0 w-100 p-3 nft-ct-border">
                  <h6 class="card-text text-start fw-light text-capitalize fst-italic"> ${data.data[i].Title} </h6>
                  <div class="row">
                    <div class="col fw-bold text-start"> <img src="/assets/img/6f8e2979d428180222796ff4a33ab929.svg" class="nft-icon" alt="Eth-logo">  &nbsp;  ${Token_Price}
                    </div>
                    <div class="col col fw-light text-capitalize"> ${data.data[i].Status != "Not for Sale" ? "Instant Buy" : "Not for Sale"}  </div>
                  </div>   
                  </div> 
              </div></a> 
          </div></div>`;
      }
      page = 1;
      totalSupply = data.results.totalSupply;
      const firstPage = 1
      const limit = data.results.limit
      const lastPage = Math.ceil(totalSupply / limit);
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
      account = await web3.eth.getAccounts().then((result) => {
        return result;
      }).catch((err) => {
        //console.log(err);
      });
      if (typeof account != "undefined") {
        // document.getElementById("CreateItemAccount").value = account[0];
      }
      endIndexForLoop = endIndex > totalSupply ? endIndex - (endIndex - totalSupply) : endIndex
      //   document.getElementById("itemsForSale").innerHTML = "";
      document.getElementById("itemsForSale").innerHTML += `
      <div class="row w-100">
        <nav aria-label="Page navigation example" style="display: flex; justify-content: flex-end">
          <ul class="pagination" id="pagination"> </ul>
        </nav>
      </div>`
      if (typeof firstPage != "undefined" && totalSupply > limit) {
        //console.log("firstPage");
        //console.log(firstPage);
        document.getElementById("pagination").innerHTML += `
          <li class="page-item"><a class="page-link" onclick="filter(${firstPage})" href="#">First</a></li>
        `
      }
      if (typeof data.results.previous != "undefined" && totalSupply > (limit + limit)) {
        //console.log("data.results.previous.page");
        //console.log(data.results.previous.page);
        document.getElementById("pagination").innerHTML += `
          <li class="page-item"><a class="page-link" onclick="filter(${data.results.previous.page})" href="#">Previous</a></li>
        `
      }
      if (typeof data.results.next != "undefined" && totalSupply > (limit + limit)) {
        //console.log("data.results.next.page");
        //console.log(data.results.next.page);
        document.getElementById("pagination").innerHTML += `
          <li class="page-item"><a class="page-link" onclick="filter(${data.results.next.page})" href="#">Next</a></li>
        `
      }
      if (typeof lastPage != "undefined" && totalSupply > limit) {
        //console.log("lastPage");
        //console.log(lastPage);
        document.getElementById("pagination").innerHTML += `
          <li class="page-item"><a class="page-link" onclick="filter(${lastPage})" href="#">Last</a></li>
        `
      }
    });
  //loading.out();
}


function Update_status() {
  const TokenID_status = document.getElementById("TokenID_status").value
  const TokenStatus_status = document.getElementById("TokenStatus_status").value
  //console.log(TokenID_status);
  //console.log(TokenStatus_status);

  //console.log(contract);
  //console.log(accounts[0]);

  if (TokenID_status == "") {
    document.getElementById("Error_status").style.display = "block";
    document.getElementById("Error_status").innerText = "Please enter token id";
    document.getElementById("Success_status").style.display = "none";
    return false;
  }

  if (TokenID_status != "" && TokenStatus_status == "Instant_buy") {
    document.getElementById("Success_status").style.display = "block";
    document.getElementById("Success_status").innerText = "Please wait for confirmation response.";
    document.getElementById("Error_status").style.display = "none";

    // alert("Instant_buy")
    contract.methods.is_BuyAble(TokenID_status).send({ from: accounts[0] })
      .then(async (result) => {
        //console.log(result);
        document.getElementById("Success_status").style.display = "block";
        document.getElementById("Success_status").innerText = "Status updated to Instant Buy.";
        document.getElementById("Error_status").style.display = "none";

        await fetch(`${URL}home/updateTokenStatus/${TokenID_status}/${TokenStatus_status}`)
          .then(response => response.json())
          .then(data => {
            //console.log(data)

          })
          .catch((err) => {
            //console.log(err);
          });

      }).catch((err) => {
        //console.log(err);
        document.getElementById("Error_status").style.display = "block";
        document.getElementById("Error_status").innerText = "Metamask transaction error...";
        document.getElementById("Success_status").style.display = "none";

      });
  }

  if (TokenID_status != "" && TokenStatus_status == "Not for Sale") {
    document.getElementById("Success_status").style.display = "block";
    document.getElementById("Success_status").innerText = "Please wait for confirmation response.";
    document.getElementById("Error_status").style.display = "none";

    // alert("Not for Sale")
    contract.methods.isNot_BuyAble(TokenID_status).send({ from: accounts[0] })
      .then(async (result) => {
        //console.log(result);
        document.getElementById("Success_status").style.display = "block";
        document.getElementById("Success_status").innerText = "Status updated to Not for Sale.";
        document.getElementById("Error_status").style.display = "none";

        await fetch(`${URL}updateTokenStatus/${TokenID_status}/${TokenStatus_status}`)
          .then(response => response.json())
          .then(data => {
            //console.log(data)

          })
          .catch((err) => {
            //console.log(err);
          });

      }).catch((err) => {
        // console.log(err);
        document.getElementById("Error_status").style.display = "block";
        document.getElementById("Error_status").innerText = "Metamask transaction error...";
        document.getElementById("Success_status").style.display = "none";

      });
  }


}

async function Set_NewPrice() {
  const TokenID_setNew = document.getElementById("TokenID_setNew").value
  const TokenPrice_setNew = document.getElementById("TokenPrice_setNew").value

  if (TokenID_setNew == "") {
    document.getElementById("Error_setNew").style.display = "block"
    document.getElementById("Error_setNew").innerText = "Enter Token ID..."
    document.getElementById("Success_setNew").style.display = "none"
  }
  if (TokenPrice_setNew == "") {
    document.getElementById("Error_setNew").style.display = "block"
    document.getElementById("Error_setNew").innerText = "Enter Token Price..."
    document.getElementById("Success_setNew").style.display = "none"
  }

  if (TokenID_setNew != "" && TokenPrice_setNew != '') {
    document.getElementById("Success_setNew").style.display = "block"
    document.getElementById("Success_setNew").innerText = "Wait for transaction response."
    document.getElementById("Error_setNew").style.display = "none"

    //console.log(Token_Purchase);
    //console.log(accounts[0]);

    await contract.methods.updateTokenPrice(parseInt(TokenID_setNew), parseFloat(TokenPrice_setNew)).send({ from: accounts[0] })
      .then(async (result) => {
        // console.log(result);

        document.getElementById("Success_setNew").style.display = "block"
        document.getElementById("Success_setNew").innerText = "Price updated successfully."
        document.getElementById("Error_setNew").style.display = "none"

        fetch(`${URL}home/updateTokenPrice/${TokenID_setNew}/${TokenPrice_setNew}`)
          .then(response => response.json())
          .then(data => {
            // console.log(data)

          })
          .catch((err) => {
            // console.log(err);
          });

      }).catch((err) => {
        //console.log(err);

        document.getElementById("Error_setNew").style.display = "block"
        document.getElementById("Error_setNew").innerText = "Error occurs due to may be 'You are not Owner of this Token' or Entered invalid Token ID or else...";
        document.getElementById("Success_setNew").style.display = "none"

      });

  }

}

async function Token_Purchase() {

  account = await web3.eth.getAccounts().then((result) => {
    console.log(result);
  }).catch((err) => {
    console.log(err);
  });
  // console.log(account);

  await contract.methods.purchaseToken(parseInt(TokenID_Purchase)).send({ from: accounts[0], value: parseFloat(TokenPrice_Purchase) })
    .then(async (result) => {
      // console.log(result);

      document.getElementById("Success_Purchase").style.display = "block"
      document.getElementById("Success_Purchase").innerText = "Purchase successfull."
      document.getElementById("Error_Purchase").style.display = "none"

      fetch(`${URL}home/purchaseToken/${TokenID_Purchase}/${accounts[0]}/${TokenPrice_Purchase}`)
        .then(response => response.json())
        .then(data => {
          // console.log(data)

        })
        .catch((err) => {
          console.log(err);
        });

    }).catch((err) => {
      console.log(err);

      document.getElementById("Error_Purchase").style.display = "block"
      document.getElementById("Error_Purchase").innerText = "Error occurs due to may be 'Token Not for Sale' or 'You owns this Token' or Entered invalid Price or else..."
      document.getElementById("Success_Purchase").style.display = "none"

    });

}


function OwnerOf(id) {
  contract.methods.ownerOf(1).call().then((result) => {
    console.log("result");
    console.log(result);
  }).catch((err) => {
    console.log("err");
    console.log(err);
  });
}

$(document).ready(async function () {
  path = document.getElementById("path")

  if (path != null) {
    if (path.value != "") {
      setTimeout(() => {
        pinFileToIPFS(path.value);
        //  pinFileToIPFS();
      }, 1000);
    }
  }

});


// --------------------------------------------------------------------------------------------------------- //
// -----     -----     -----     -----     -----     -----     -----     -----     -----     -----     ----- //
// --------------------------------------------------------------------------------------------------------- //

// This is use for checking only one checkbox at a time for "Sort By".
var $checks = $('.styled123');
$checks.click(function () {
  $checks.not(this).prop("checked", false);
});

// Get value of "Sort By"
function asd111() {
  return $(".styled123:checked").val();
}



