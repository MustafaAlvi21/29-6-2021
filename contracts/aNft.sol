import "./ERC721Full.sol";

pragma solidity >=0.4.0 <0.8.2;

contract Nft is ERC721Full { 
    
    
    struct data { string URL;string Title;uint256 Token_ID;uint256 Token_Price;bool Status; }
      
      data[] public nft;
      mapping(string => bool) _nftExists;
    
      constructor() ERC721Full("Nft", "NFT") public { }
      
      function mint(string memory url, string memory Title, uint256 Token_Price, bool _status) public {
        require(!_nftExists[url], "AlreadyExist.");
        data memory data123 = data(url,Title,nft.length,Token_Price,_status);
        uint _id = nft.push(data123);
        _mint(msg.sender, _id-1);
        _setTokenURI( _id-1, url);
        _nftExists[url] = true;
     }
     
     function is_BuyAble(uint Token_ID) public {
        require(msg.sender == ownerOf(Token_ID), "OnlyOwner");
        require(T_In_Auction[Token_ID] == false , "TokenIsAuction");
        require(nft[Token_ID].Status == false, "TokenForSale");  
        nft[Token_ID].Status = true;
        approve(address(this), Token_ID);
     }
    
     function isNot_BuyAble(uint Token_ID) public {
        require(msg.sender == ownerOf(Token_ID), "OnlyOwner");
        require(nft[Token_ID].Status == true, "TokenNotForSale");  
        require(T_In_Auction[Token_ID] == false , "TokenInAuction");
        nft[Token_ID].Status = false;
     }
     
     function purchaseToken(uint256 Token_ID) public payable{
         require(T_In_Auction[Token_ID] == false , "TokenInAuction");
         require(nft[Token_ID].Status == true, "TokenNotForSale");
         require(nft[Token_ID].Token_Price <= msg.value, "Invalid price");
         address(uint168(ownerOf(Token_ID))).transfer(msg.value);
         nft[Token_ID].Token_Price = msg.value;
         TokenTransfer123(ownerOf(Token_ID), msg.sender, Token_ID, msg.value);
     }
     
     function TokenTransfer123(address owner, address to, uint256 Token_ID, uint256 Token_price)internal{
         transferFrom(owner, to, Token_ID);
         nft[Token_ID].Status = false;
         nft[Token_ID].Token_Price = Token_price;
     }
     
     function updateTokenPrice(uint _tokenID, uint _price) public returns(string memory){
        require(T_In_Auction[_tokenID] == false , "TokenInAuction");
        nft[_tokenID].Token_Price = _price;
        return "PriceUpdated";
     }
     
    mapping (uint => bool) public T_In_Auction;
    mapping (uint => Auction_data) public T_Auction;
    mapping(uint => mapping(address => uint)) public bids;
    mapping(uint => address[]) public token_bidders;    
    address[] bidder_list;

    struct Auction_data{
        uint Token_id; 
        address auction_owner; 
        address auction_winner; 
        uint256 auction_win_bid; 
        uint256 auction_start; 
        uint256 auction_end; 
        uint256 highestBid; 
        address highestBidder;
        uint256 minimunBid; 
        uint256 maximunBid; 
        bool state;
        address[] bidders;
    }

    function create_Auction (uint _biddingTime, uint T_id, uint _minBid, uint _maxBid) public {
        require(msg.sender == ownerOf(T_id), "OnlyOwner");
        require(nft[T_id].Status == false, "TokeForSale");
        require(T_In_Auction[T_id] == false, "TokenInAuction");
        address[] memory emptyAddressList;
        Auction_data memory data1750 = Auction_data(T_id,ownerOf(T_id),address(0),0, now,(now +_biddingTime*1 minutes),0,address(0),_minBid,_maxBid, true, emptyAddressList);
        T_Auction[T_id] = data1750; 
        T_In_Auction[T_id] = true; 
        token_bidders[T_id].length = 0;
        approve(address(this), T_id);
    }
        
    // Not done yet => agr koi higgest bid kerre to token usko transfer hojai
    function bid(uint T_id) public payable in_auction(T_id) only_bidders(T_id) not_auction_winner(T_id) returns (bool){ 
        require(bids[T_id][msg.sender] + msg.value >=  T_Auction[T_id].minimunBid, "makeHigherBid");
        require(bids[T_id][msg.sender] + msg.value <=  T_Auction[T_id].maximunBid, "makeLowerBid");
        if(block.timestamp < T_Auction[T_id].auction_end){
            if(bids[T_id][msg.sender] + msg.value >= T_Auction[T_id].maximunBid){
                // bid hits maximum amount
                    T_Auction[T_id].state = false;
                    T_Auction[T_id].auction_win_bid = bids[T_id][msg.sender] + msg.value;
                    T_Auction[T_id].auction_winner = msg.sender;
                    T_Auction[T_id].highestBidder = address(0);
                    T_Auction[T_id].highestBid = 0;
                    bids[T_id][msg.sender] = 0;
                    address(uint168(ownerOf(T_id))).transfer(T_Auction[T_id].auction_win_bid);
                    T_In_Auction[T_id] = false; 
                    TokenTransfer123(ownerOf(T_id), msg.sender, T_id, T_Auction[T_id].auction_win_bid);
                    emit EndedEvent("Auction ended", block.timestamp); 
            } else {
                // bid not hits maximum amount
                
                bids[T_id][msg.sender] = bids[T_id][msg.sender] + msg.value;
                bidder_list = token_bidders[T_id];
                bidder_list.push(msg.sender);
                token_bidders[T_id] = bidder_list;
                T_Auction[T_id].highestBidder = T_Auction[T_id].highestBid > bids[T_id][msg.sender]  ? T_Auction[T_id].highestBidder : msg.sender;
                T_Auction[T_id].highestBid =  T_Auction[T_id].highestBid > bids[T_id][msg.sender] ? T_Auction[T_id].highestBid : bids[T_id][msg.sender];
                T_Auction[T_id].bidders.push(msg.sender);
                emit  BidEvent(msg.sender, msg.value);
                return true;
            }
        } else {
            end_auction_auto(T_id);
        }
    } 
    
    function withdraw(uint T_id) public only_bidders(T_id) auction_ended(T_id) not_auction_winner(T_id) returns (bool){
        uint amount = bids[T_id][msg.sender];
        msg.sender.transfer(amount); 
        bids[T_id][msg.sender] = 0; 
        emit WithdrawalEvent(msg.sender, amount); 
        return true;
    }  
    
    function end_auction(uint T_id) public payable only_owner(T_id) returns (bool, string memory) { 
        require(T_In_Auction[T_id] == true, "TokenInAuction");
        require(nft[T_id].Status == false,"TokenForSale");
        T_Auction[T_id].state = false;
        T_In_Auction[T_id] = false; 
        if(T_Auction[T_id].highestBidder == address(0)){ return (true, "Auction Ended");}
        T_Auction[T_id].auction_win_bid = T_Auction[T_id].highestBid;
        T_Auction[T_id].auction_winner = T_Auction[T_id].highestBidder;
        T_Auction[T_id].highestBidder = address(0);
        T_Auction[T_id].highestBid = 0;
        bids[T_id][T_Auction[T_id].auction_winner] = 0;
        address(uint168(ownerOf(T_id))).transfer(T_Auction[T_id].highestBid);
        TokenTransfer123(ownerOf(T_id), T_Auction[T_id].auction_winner, T_id, T_Auction[T_id].auction_win_bid);
        emit EndedEvent("Auction ended", block.timestamp); 
        return (true, "Auction Ended");
    }
    
    function end_auction_auto(uint T_id)public payable auctionTime_ends(T_id) returns (bool, string memory) { 
        require(T_In_Auction[T_id] == true , "This Token is not in Auction");
        T_Auction[T_id].state = false;
        T_In_Auction[T_id] = false; 
        T_Auction[T_id].auction_win_bid = T_Auction[T_id].highestBid;
        T_Auction[T_id].auction_winner = T_Auction[T_id].highestBidder;
        T_Auction[T_id].highestBidder = address(0);
        T_Auction[T_id].highestBid = 0;
         bids[T_id][T_Auction[T_id].auction_winner] = 0;
        address(msg.sender).transfer(msg.value);
        address(uint168(ownerOf(T_id))).transfer(T_Auction[T_id].highestBid);
        TokenTransfer123(ownerOf(T_id), T_Auction[T_id].auction_winner, T_id, T_Auction[T_id].auction_win_bid);
        emit EndedEvent("Auction ended", block.timestamp); 
        return (true, "Auction Ended");
    }
     
    modifier in_auction(uint T_id){ 
        require( T_In_Auction[T_id] == true, "tokenNotInAuction");
        _;
    } 
   
    modifier an_ongoing_auction(uint T_id){ 
        require( block.timestamp < T_Auction[T_id].auction_end, "BiddingIsEnd");
        _;
    } 
   
    modifier auctionTime_ends(uint T_id){ 
        require( block.timestamp > T_Auction[T_id].auction_end, "BiddingNotEnd");
        _;
    } 
   
    modifier auction_ended(uint T_id){ 
        require( T_Auction[T_id].state == false, "AuctionIsGoing");
        _;
    } 
   
    modifier only_owner(uint T_id){ 
        require(msg.sender == T_Auction[T_id].auction_owner, "OnlyOwner");
        _;
    } 
   
    modifier only_bidders(uint T_id){ 
        require(msg.sender != T_Auction[T_id].auction_owner, "OnlyBidderAction");
        _;
    } 
    
    modifier not_auction_winner(uint T_id){ 
        require(msg.sender != T_Auction[T_id].auction_winner, "AuctionWinner");
        _;
    } 
    event BidEvent(address indexed Bidder, uint256 Bid); 
    event WithdrawalEvent(address withdrawer, uint256 amount);
    event EndedEvent(string message, uint256 time);

}