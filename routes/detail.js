const router = require("express").Router();
const Web3 = require('web3')
const Nft = require('../build/abi network/Nft.json')
const multer = require("multer");
const path = require("path")
const fs = require("fs")
//const watermark = require('purejswatermark/dist/watermark');
const Token_Model = require("../model/token");
const User_Model = require("../model/users");
const userStatus = require("../middlewares/checkUserStatus");
const axios = require('axios');
const { type } = require("os");



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
/*                    Details                      */
/*  ---------------------------------------------  */
router.get('/', async (req, res) => {
  id = req.query.id

  data = await Token_Model.updateOne({ _id: id }, { $inc: { views: 1 } })
    .then(async data => { })
    .catch(err => { })



  data = await Token_Model.findOne({ _id: id }).then(async data => {

    //console.log('data ::::::::::::', data['0'].File);

    if (data != null) {
      let promises = data.Owner_History.slice(0, 3);
      Promise.all(promises)
        .then(async (result) => {
          iLength = 2;
          console.log(result.length);  // > 3 ? 3 : result.length;

          for (let i = 0; i < result.length; i++) {
            a = await getData(result[i].owner)
            if (typeof a.user_id != "undefined") {
              result[i].user_id = a.user_id;
            }
            if (typeof a.user_DP != "undefined") {
              result[i].user_DP = a.user_DP;
            }
          }

          if (typeof data != "undefined" && data != null) {
            user = await User_Model.findOne({ user_wallet: data.Owner.owner });
            relatedData = await Token_Model.aggregate([{ $match: { Category: data.Category } }, { $sample: { size: 5 } }]).then(async (data2) => {
              if (data2) {
                return data2
              }
            }).catch((err) => {
              return res.status(404).render('404', { userLogin: req.session.user != null ? req.session.user.user_id : undefined });
            })

          } else {
            return res.status(404).render('404', { userLogin: req.session.user != null ? req.session.user.user_id : undefined });
          }

          console.log("------------- ------------  data  -------- -------------");
          console.log(data);
          console.log(data.nftType);
          // watermark([data.URL, '/assets/img/watermark.png'], options)
          //   .image(watermark.image.lowerRight(0.5))
          //   .then(img => console.log('img:::::', img));
          console.log("------------- ------------  data  -------- -------------");

          if (data.Status == "Auctioned") {
            highestBidderData = await User_Model.findOne({ user_wallet: data.AuctionData.highestBidder }, { Activity: 0 })
            console.log(highestBidderData);
          }
          res.render("detail", { data, highestBidderData: typeof highestBidderData != "undefined" ? highestBidderData : undefined, relatedData, userData: user, userLogin: req.session.user != null ? req.session.user : undefined })
        }).catch((err) => {
          console.log(err);
          return res.status(404).render('404', { userLogin: req.session.user != null ? req.session.user.user_id : undefined });
        });

    } else {
      return res.status(404).render('404', { userLogin: req.session.user != null ? req.session.user.user_id : undefined });
    }


  }).catch(err => {
    return res.status(404).render('404', { userLogin: req.session.user != null ? req.session.user.user_id : undefined });
  })





  async function getData(params111) {
    console.log(params111);
    asd = await User_Model.findOne({ user_wallet: params111 }).then((result) => {
      // console.log(result);
      return result;
    }).catch((err) => {
      console.log(err);
    });

    return asd;
  }

  // console.log("data");
  // console.log(data);
  // console.log("data");



});


router.get("/place-bid/:id/:placeBid/:account", userStatus, async (req, res) => {
  if (!req.session.user) { req.flash("error", "Please login first"); return res.redirect("/"); }
  if (req.params.id != "" || req.params.placeBid != "") {

    Auction = await Token_Model.findOne({ Token_ID: req.params.id })
      .then(data => { return data; })
      .catch(err => { console.log(err); return res.status(404).render('404'); });

    updateQuery = {};
    if (Auction.AuctionData.highestBid < req.params.placeBid) {
      updateQuery = {
        "AuctionData.highestBid": req.params.placeBid, "AuctionData.highestBidder": req.params.account
      }
    }
    if (Object.keys(updateQuery).length > 0) {
      data = await Token_Model.updateOne(
        { Token_ID: req.params.id },
        { $set: updateQuery },
        { upsert: true }
      )
        .exec()
        .then(data => {
          console.log(data);
          if (!data) {
            req.flash("error", "Inaccessible token or not owned by you.")
            return res.redirect("/");
          }
          return data;
        })
        .catch(err => { console.log(err); return res.status(404).render('404'); })
    }


    var unixTimestamp = Date.now();
    var date = new Date(unixTimestamp);
    newDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    // update auction maker activity
    await User_Model.updateOne({ "user_wallet": req.session.user.user_wallet },
      // { "$push": { 
      //     "Activity": { 




      //         "Date" : newDate
      //     } }}

      {
        $push: {
          Activity: {
            $each: [{
              "message": "Bid on Token Auction",
              "timestamp": Date.now(),
              "Token_ID": req.params.id,
              "Price": req.params.placeBid,
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


    return res.json({ Success_Purchase: "Bid placed" })

  } else {
    return res.status(404).render('404', { userLogin: req.session.user != null ? req.session.user.user_id : undefined });
  }
});


router.get("/withdraw/:token_id/:bidPrice", userStatus, async (req, res) => {
  if (!req.session.user) { req.flash("error", "Please login first"); return res.redirect("/"); }


  var unixTimestamp = Date.now();
  var date = new Date(unixTimestamp);
  newDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  // update auction maker activity
  await User_Model.updateOne({ "user_wallet": req.session.user.user_wallet },
    // { "$push": { 
    //     "Activity": { 

    //     } }}

    {
      $push: {
        Activity: {
          $each: [{
            "message": "Withdraw Token Bid",
            "timestamp": Date.now(),
            "Token_ID": req.params.token_id,
            "Price": req.params.bidPrice,
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


  return res.json({ Success_Purchase: "Bid placed" })

})

router.get("/end-auction", userStatus, async (req, res) => {
  if (!req.session.user) { req.flash("error", "Please login first"); return res.redirect("/"); }

  ownership_history = await Token_Model.findOne({ Token_ID: req.query.Token_id }, { Owner_History: 1, Owner: 1 }).then((result) => {
    console.log(result);
    return result;
  }).catch((err) => {
    console.log(err);
    return err;
  });
  Owner_History = [
    {
      owner: req.query.auction_winner, timestamp: Date.now(),
    }, ...ownership_history.Owner_History,
  ]

  data = await Token_Model.updateOne(
    { Token_ID: req.query.Token_id },
    {
      Owner: {
        owner: req.query.auction_winner,
        timestamp: Date.now()
      },
      Token_Price: req.query.auction_win_bid,
      Token_PriceInWei: parseInt(req.query.auction_win_bid) * 1000000000000000000,
      Status: "Not for Sale",
      $set: {
        'Owner_History': Owner_History,
        "AuctionData.Token_id": req.query.Token_id,
        "AuctionData.auction_end": req.query.auction_end,
        "AuctionData.auction_owner": req.query.auction_owner,
        "AuctionData.auction_start": req.query.auction_start,
        "AuctionData.auction_win_bid": req.query.auction_win_bid,
        "AuctionData.auction_winner": req.query.auction_winner,
        "AuctionData.highestBid": req.query.highestBid,
        "AuctionData.highestBidder": req.query.highestBidder,
        "AuctionData.maximunBid": req.query.maximunBid,
        "AuctionData.minimunBid": req.query.minimunBid,
        "AuctionData.state": req.query.state
      }
    },
    { upsert: true }
  )
    .exec()
    .then(data => {
      console.log(data);
      if (!data) {
        req.flash("error", "Inaccessible token or not owned by you.")
        return res.redirect("/");
      }
      return data;
    })
    .catch(err => { console.log(err); return res.status(404).render('404'); })

  var unixTimestamp = Date.now();
  var date = new Date(unixTimestamp);
  newDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  // update auction winner activity
  await User_Model.updateOne({ "user_wallet": req.query.auction_winner },
    // { "$push": { 
    //     "Activity": { 

    //     } }}

    {
      $push: {
        Activity: {
          $each: [{
            "message": "Token purchase by Auction successful",
            "timestamp": Date.now(),
            "Token_ID": req.query.Token_id,
            "Price": req.query.auction_win_bid,
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

  // update auction maker activity
  await User_Model.updateOne({ "user_wallet": req.query.auction_owner },
    // { "$push": { 
    //     "Activity": { 

    //     } }}

    {
      $push: {
        Activity: {
          $each: [{
            "message": "Token sell by Auction successful",
            "timestamp": Date.now(),
            "Token_ID": req.query.Token_id,
            "Price": req.query.auction_win_bid,
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


  return res.json({ Success_Purchase: "Bid placed" })
});



module.exports = router