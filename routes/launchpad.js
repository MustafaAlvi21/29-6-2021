const router = require("express").Router();
const multer = require("multer");
const path = require("path")
const fs = require("fs")
const User_Model = require("../model/users");
const axios = require('axios');

router.get("/", async (req, res) => {
    // user = await User_Model.findOne({ user_wallet: req.session.user.user_wallet })
    // .then(data => { return data; })
    // .catch(err => { console.log(err); return res.status(404).render('404'); });
    res.render("launchPad", { userLogin: req.session.user != null ? req.session.user : undefined })

});


module.exports = router