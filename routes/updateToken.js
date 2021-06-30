const router = require("express").Router();
const multer = require("multer");
const path = require("path")
const fs = require("fs")
const Token_Model = require("../model/token");
const User_Model = require("../model/users");
const axios = require('axios');



/*  ---------------------------------------------  */
/*                 Multer Upload                   */
/*  ---------------------------------------------  */
const Storage = multer.diskStorage({
    destination: "./public/Uploads",
    filename: (req, file, cb) => {
        cb(null, file.originalname + "_" + Date.now() + path.extname(file.originalname))
    }
});

var multerUploads = multer({
    storage: Storage
})
var cpUpload = multerUploads.fields([{ name: 'File', maxCount: 1 }])




/*  ---------------------------------------------  */
/*                    Update                       */
/*  ---------------------------------------------  */
router.get("/", async (req, res) => {
    if (!req.session.user) { req.flash("error", "Please login first"); return res.redirect("/"); }

    user = await User_Model.findOne({ user_wallet: req.session.user.user_wallet })
        .then(data => { return data; })
        .catch(err => { console.log(err); return res.status(404).render('404'); });

    //console.log('req.session.user', req.session.user);

    data = await Token_Model.findOne({ Token_ID: req.query.i, "Owner.owner": req.session.user.user_wallet })
        .then(data => {
            //console.log(data);
            if (data == null) {
                console.log(data);
                return res.status(404).render('404');
            } else {
                //console.log("data", req.session.user);
                //res.render("updateToken", { data, userData: user, userLogin: req.session.user != null ? req.session.user.user_id : undefined });
                res.render("updateToken", { data, userData: user, userActivity, userLogin: req.session.user != null ? req.session.user : undefined })
            }

        })
        .catch(err => { console.log(err); return res.status(404).render('404'); })

});


/*  ---------------------------------------------  */
/*                 Update Status                   */
/*  ---------------------------------------------  */
router.get("/:id/:status", async (req, res) => {
    if (!req.session.user) { req.flash("error", "Please login first"); return res.redirect("/"); }

    user = await User_Model.findOne({ user_wallet: req.session.user.user_wallet })
        .then(data => { return data; })
        .catch(err => { console.log(err); return res.status(404).render('404'); });

    data = await Token_Model.updateOne(
        { Token_ID: req.params.id, "Owner.owner": req.session.user.user_wallet },
        { $set: { Status: req.params.status } }
    )
        .exec()
        .then(data => {
            console.log(data);
            if (!data) {
                req.flash("error", "Inaccessible token or not owned by you.")
                return res.redirect("/profile");
            }
            return data;
        })
        .catch(err => { console.log(err); return res.status(404).render('404'); })


    var unixTimestamp = Date.now();
    var date = new Date(unixTimestamp);
    newDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    await User_Model.updateOne({ "user_wallet": req.session.user.user_wallet },
        {
            $push: {
                Activity: {
                    $each: [{
                        "message": "Token status updated",
                        "timestamp": Date.now(),
                        "Token_ID": req.params.id,
                        "Status": req.params.status,
                        "Date": newDate
                    }], $position: 0
                }
            }
        })




        .exec()
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.log(err);
        })

    return res.json({ Success_Purchase: "updated..." })
});


/*  ---------------------------------------------  */
/*                 Create Auction                  */
/*  ---------------------------------------------  */
router.get("/Auction/:Token_id/:auction_end/:auction_owner/:auction_start/:auction_win_bid/:auction_winner/:highestBid/:highestBidder/:maximunBid/:minimunBid/:state/", async (req, res) => {
    if (!req.session.user) { req.flash("error", "Please login first"); return res.redirect("/"); }

    user = await User_Model.findOne({ user_wallet: req.session.user.user_wallet })
        .then(data => { return data; })
        .catch(err => { console.log(err); return res.status(404).render('404'); });

    data = await Token_Model.updateOne(
        { Token_ID: req.params.Token_id, "Owner.owner": req.session.user.user_wallet },
        {
            $set: {
                Status: "Auctioned",
                AuctionData: {
                    Token_id: req.params.Token_id,
                    auction_end: req.params.auction_end,
                    auction_owner: req.params.auction_owner,
                    auction_start: req.params.auction_start,
                    auction_win_bid: req.params.auction_win_bid,
                    auction_winner: req.params.auction_winner,
                    highestBid: req.params.highestBid,
                    highestBidder: req.params.highestBidder,
                    secondBid: "0",
                    secondBidder: "0x0000000000000000000000000000000000000000",
                    thirdBid: "0",
                    thirdBidder: "0x0000000000000000000000000000000000000000",
                    maximunBid: req.params.maximunBid,
                    minimunBid: req.params.minimunBid,
                    state: req.params.state
                }
            }
        }
    )
        .exec()
        .then(data => {
            console.log(data);
            if (!data) {
                req.flash("error", "Inaccessible token or not owned by you.")
                return res.redirect("/profile");
            }
            return data;
        })
        .catch(err => { console.log(err); return res.status(404).render('404'); })


    var unixTimestamp = Date.now();
    var date = new Date(unixTimestamp);
    newDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    await User_Model.updateOne({ "user_wallet": req.session.user.user_wallet },
        {
            "$push": {
                "Activity": {
                    "message": "Token set to Auction",
                    // "Title": req.body.Name, 
                    "Status": "Auction",
                    "Token_ID": req.params.Token_id,
                    "Duration": req.params.auction_end,
                    "MinBid": req.params.maximunBid,
                    "MaxBid": req.params.minimunBid,
                    "timestamp": Date.now(),
                    "Date": newDate
                }
            }
        })
        .exec()
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.log(err);
        })

    return res.json({ Success_Purchase: "updated..." })
});


/*  ---------------------------------------------  */
/*                  Update Price                   */
/*  ---------------------------------------------  */
router.get("/price/:id/:price", async (req, res) => {
    if (!req.session.user) { req.flash("error", "Please login first"); return res.redirect("/"); }
    user = await User_Model.findOne({ user_wallet: req.session.user.user_wallet })
        .then(data => { return data; })
        .catch(err => { console.log(err); return res.status(404).render('404'); });

    priceInEther = req.params.price;
    priceInWei = 1000000000000000000 * parseFloat(req.params.price);

    data = await Token_Model.updateOne(
        { Token_ID: req.params.id, "Owner.owner": req.session.user.user_wallet },
        { $set: { Token_Price: priceInEther, Token_PriceInWei: priceInWei } }
    )
        .exec()
        .then(data => {
            console.log(data);
            if (!data) {
                req.flash("error", "Inaccessible token or not owned by you.")
                return res.redirect("/profile");
            }
            return data;
        })
        .catch(err => { console.log(err); return res.status(404).render('404'); })

    var unixTimestamp = Date.now();
    var date = new Date(unixTimestamp);
    newDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    await User_Model.updateOne({ "user_wallet": req.session.user.user_wallet },
        {
            $push: {
                Activity: {
                    $each: [{
                        "message": "Token price updated",
                        "timestamp": Date.now(),
                        "Token_ID": req.params.id,
                        "Price": req.params.price,
                        "Date": newDate
                    }], $position: 0
                }
            }
        }
    )
        .exec()
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.log(err);
        })


    return res.json({ Success_Purchase: "updated..." })
});



module.exports = router