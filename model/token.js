const mongoose = require('mongoose');

const Token_Schema = new mongoose.Schema({
    Creator: { type: Object, required: true },
    Owner: { type: Object, required: true },
    Owner_History: { type: Array, required: true },
    File: { type: String, required: true },
    thumb: { type: String, required: false },
    nftType: { type: String, required: false },
    Title: { type: String, required: true },
    Description: { type: String, required: true },
    Token_ID: { type: String, required: true },
    Token_Price: { type: String, required: true },
    Token_PriceInWei: { type: Number, required: false },
    URL: { type: String, required: true },
    Category: { type: String, required: true },
    externalLink: { type: String, required: false },
    timestamp: { type: Number, required: true },
    AuctionData: { type: Object, required: false },
    Status: { type: String, required: true, enum: ["Instant_buy", "Not for Sale", "Auctioned", "Blocked"] },
    views: { type: Number, required: false }
});

const Token_Model = mongoose.model("tokens", Token_Schema);
module.exports = Token_Model;