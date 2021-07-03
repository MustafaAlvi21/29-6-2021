async function loadAcount() {
    if (window.ethereum) {
        window.web3 = await new Web3(window.ethereum)
    }
    else if (window.web3) {
        window.web3 = await new Web3(window.web3.currentProvider)
    }
    else {
        toastr.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    account = await window.web3.eth.getAccounts();
    console.log(account);
    document.getElementById("CreateItemAccount").value = account[0];
}
loadAcount();

var loadFile = function (event) {
    var reader = new FileReader();
    reader.onload = function () {
        var output = document.getElementById('outputIMG');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
};

var loadThumb = function (event) {
    var reader = new FileReader();
    reader.onload = function () {
        var output = document.getElementById('outputTHUMB');
        output.src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
};