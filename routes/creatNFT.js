const router = require("express").Router();
const multer = require("multer");
const path = require("path")
const fs = require("fs");
var Jimp = require('jimp');
const gifResize = require('@gumlet/gif-resize');
const Token_Model = require("../model/token");
const User_Model = require("../model/users");
const userStatus = require("../middlewares/checkUserStatus");
const ipfsAPI = require("ipfs-api");
const { token } = require("morgan");
const { resolve } = require("path");
const { rejects } = require("assert");
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' });

/*  ---------------------------------------------  */
/*                 Multer Upload                   */
/*  ---------------------------------------------  */
const Storage = multer.diskStorage({
    destination: "./public/Uploads",
    filename: (req, file, cb) => {
        cb(null, "_" + Date.now() + path.extname(file.originalname))
        //file.originalname + 
    }
});

var multerUploads = multer({ storage: Storage })
var cpUpload = multerUploads.fields([{ name: 'File', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }])
// var thUpload = multerUploads.fields([{ name: 'thumbnail', maxCount: 1 }])
/*  ---------------------------------------------  */
/*                      Home                       */
/*  ---------------------------------------------  */
router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect("/home");
    }

    const page = req.query.cat;
    res.render("createNFT", { userLogin: req.session.user != null ? req.session.user : undefined });
});

/*  ---------------------------------------------  */
/*                 Image To IPFS                   */
/*  ---------------------------------------------  */
//  Yay route sirf is liay hay k form upload ki pic ko IPFS main save kerke k uska path wapis send kerre HTML file ko
router.post('/', cpUpload, userStatus, async (req, res, next) => {
    // console.log("req.session");
    // console.log(req.session);
    // console.log(req.session.user);
    // console.log(req.body);
    if (req.session.user == null || typeof req.session.user == "undefined") {
        req.flash("error", "You need to login for token creation");
        return res.redirect("/");
    }
    if (req.session.user.user_wallet != req.body.account) {
        req.flash("error", "Login with valid account or logout then login again");
        return res.redirect("/");
    } //thumb
    cover1 = req.files.File;
    thumb1 = req.files.thumbnail;

    let Time = Date.now();
    let FileTumbName = '_' + Time + path.extname(thumb1[0].originalname);
    const destinationThubm = thumb1['0'].destination + '/thumb/' + FileTumbName;
    if (thumb1[0].mimetype != 'image/gif') {
        Jimp.read(thumb1['0'].path, (err, lenna) => {
            if (err) throw err;
            lenna
                .resize(Jimp.AUTO, 250)
                .quality(90) // set JPEG quality
                .write(destinationThubm);
        });
    } else {
        const buf = fs.readFileSync(thumb1['0'].path);
        gifResize({
            height: 250
        })(buf).then(data => {
            fs.writeFile(destinationThubm, data, () => console.log('finished uploading!'));
        });
    }
    if (thumb1[0].mimetype != 'image/gif' && thumb1[0].mimetype != 'image/jpeg' && thumb1[0].mimetype != 'image/png' && thumb1[0].mimetype != 'image/jpg') {
        req.flash("error", "Please select a valid image file for thumbnail.");
        return res.render("createNFT");
    }
    if (cover1[0].mimetype != 'image/gif' && cover1[0].mimetype != 'image/jpeg' && cover1[0].mimetype != 'image/png' && cover1[0].mimetype != 'image/jpg' && cover1[0].mimetype != 'video/mp4' && cover1[0].mimetype != 'audio/mpeg') {
        req.flash("error", "Please select a valid image file for thumbnail.");
        return res.render("createNFT");
    }
    if (req.body.username != "" && req.body.Amount != "" && req.body.Categories != "" && req.body.description != "" && req.body.status != "" && cover1.length == 1 && thumb1.length == 1) {
        let nftType = '';
        if (cover1[0].mimetype == 'image/gif' || cover1[0].mimetype == 'image/jpeg' || cover1[0].mimetype == 'image/png' || cover1[0].mimetype == 'image/jpg') {
            nftType = 'image';
        }
        if (cover1[0].mimetype == 'video/mp4') {
            nftType = 'video';
        }
        if (cover1[0].mimetype == 'audio/mpeg') {
            nftType = 'mp3';
        }
        const base64 = fs.readFileSync(cover1[0].path, "base64");
        const buffer = Buffer.from(base64, "base64");
        file_hash = await ipfs.files.add(buffer, function (err, file) {
            if (err) {
                console.log(err);
            }
            // console.log(file);
            // console.log(thumb1);
            data = {
                nftType: nftType,
                thumb: destinationThubm,
                File: cover1[0].path,
                Name: req.body.username,
                Price: req.body.Amount,
                Category: req.body.Categories,
                Description: req.body.description,
                Status: req.body.status,
                Auction_duration: req.body.Auction_duration,
                Auction_maxBid: req.body.Auction_maxBid,
                Auction_minBid: req.body.Auction_minBid,
                externalLink: req.body.externalLink,
                path: file[0].path
            }
            asd = JSON.stringify(data)
            return res.render("index", {
                path: asd, userLogin: req.session.user != null ? req.session.user : undefined
            });
        })
    } else {
        return res.render("index");
    }
});

module.exports = router;