const router = require("express").Router();
const Web3 = require('web3')
const Nft = require('../build/abi network/Nft.json')
const multer = require("multer");
const path = require("path")
const fs = require("fs")
const Token_Model = require("../model/token");
const axios = require('axios');
const User_Model = require("../model/users");
const checkUserStatus = require("../middlewares/checkUserStatus");



/*  ---------------------------------------------  */
/*                 Multer Upload                   */
/*  ---------------------------------------------  */
const Storage = multer.diskStorage({
  destination: "./public/Users",
  filename: (req, file, cb) => {
    cb(null, file.originalname + "_" + Date.now() + path.extname(file.originalname))
  }
});

var multerUploads = multer({
  storage: Storage
})
var cpUpload = multerUploads.fields([{ name: 'File', maxCount: 1 }])


/*  ---------------------------------------------  */
/*                    Profile                      */
/*  ---------------------------------------------  */
router.get('/', checkUserStatus, async (req, res) => {
  //console.log("req.session.user", req.session.user);
  if (!req.session.user) {
    return res.redirect("/");
  }
  data = await Token_Model.find({ "Owner.owner": req.session.user.user_wallet });
  user = await User_Model.findOne({ user_wallet: req.session.user.user_wallet });
  console.log('user ::', user);
  userActivity = await User_Model.aggregate([{ $match: { user_wallet: req.session.user.user_wallet } }, { $sort: { "Activity.timestamp": -1 } }])
  // .sort( { 'Activity.timestamp': -1 } )
  // console.log("userActivity");
  // console.log(userActivity);
  // console.log("userActivity");
  // console.log(user);
  //console.log('req.session.user.user_wallet', req.session.user);
  res.render("profile", { data, userData: user, userActivity, userLogin: req.session.user != null ? req.session.user : undefined })
});


/*  ---------------------------------------------  */
/*                Update Profile                   */
/*  ---------------------------------------------  */
router.post('/update', checkUserStatus, cpUpload, async (req, res) => {
  data = {}

  if (typeof req.body.user_id != "undefined" && req.body.user_id != "") {
    data.user_id = req.body.user_id;
  }
  if (typeof req.body.Facebook != "undefined" && req.body.Facebook != "") {
    data.Facebook = req.body.Facebook;
  }
  if (typeof req.body.Twitter != "undefined" && req.body.Twitter != "") {
    data.Twitter = req.body.Twitter;
  }
  if (typeof req.body.Telegram != "undefined" && req.body.Telegram != "") {
    data.Telegram = req.body.Telegram;
  }
  if (typeof req.body.Youtube != "undefined" && req.body.Youtube != "") {
    data.Youtube = req.body.Youtube;
  }
  if (typeof req.files.File != "undefined" && req.files.File != "") {
    data.user_DP = req.files.File[0].path
    // File: cover1[0].path,
  }

  console.log("req.body");
  console.log(req.body);
  console.log(data);
  console.log(req.session.user);
  await User_Model.updateOne({ user_wallet: req.session.user.user_wallet }, { $set: data }, { upsert: true })
    .exec()
    .then((result) => {
      console.log(result);

      req.session.user.user_id = typeof req.body.user_id != "undefined" && req.body.user_id != "" ? req.body.user_id : req.session.user.user_id;
      return res.status(200).redirect('/profile')
      // render("profile",  { userLogin : req.session.user != null ? req.session.user.user_id : undefined})
    }).catch((err) => {
      console.log(err);
      req.flash("error", err)
      return res.status(500).redirect('/profile')
      // .render("profile",  { userLogin : req.session.user != null ? req.session.user.user_id : undefined})
    });
});




module.exports = router