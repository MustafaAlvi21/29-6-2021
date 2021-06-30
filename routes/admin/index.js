const router = require("express").Router();
const multer = require("multer");
const path = require("path")
const fs = require("fs")
const passport = require('passport');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const Admin_Model = require("../../model/admin");
const Token_Model = require("../../model/token");
const User_Model = require("../../model/users");
const authenticateToken = require("../../middlewares/sessionAuthenticate")
var unixTimestamp = Date.now();
var date = new Date(unixTimestamp);
newDate = date.getDate()+ "/"+(date.getMonth()+1)+ "/"+date.getFullYear()+ " "+date.getHours()+ ":"+date.getMinutes()+ ":"+date.getSeconds();



/*  ---------------------------------------------  */
/*                 Multer Upload                   */
/*  ---------------------------------------------  */
const Storage = multer.diskStorage({
    destination: "./public/Uploads",
    filename: (req, file, cb) => {
      cb(null, file.originalname + "_" + Date.now() + path.extname(file.originalname))
    }
});
  
var multerUploads =  multer({
storage: Storage
})
var cpUpload = multerUploads.fields([{ name: 'File', maxCount: 1}])



/*  ---------------------------------------------  */
/*                  Register                       */
/*  ---------------------------------------------  */
router.post("/registerAdmin", async (req, res) => { 
    encryptPass = await bcrypt.hash(req.body.password, saltRounds).then(function(hash) {  return hash  });
    await new Admin_Model({
        email    : req.body.email,
        password : encryptPass,
        dateTime : newDate 
    })
    .save()
    .then((result) => {
        return res.json({ admin:"Admin created." })
    }).catch((err) => {
        return res.json({ err })   
    });
});



/*  ---------------------------------------------  */
/*                Global login                     */
/*  ---------------------------------------------  */
router.get("/sign-in", (req, res) => {
    // return res.json({ admin:"admin" })
    return res.render("amdinStaticFiles/sign_in")
});


router.post('/sign-in', async (req, res) => {
    await Admin_Model.findOne({ email : req.body.email }, {_id:1, role:1, email:1, password: 1}).then( async user => {
        if (!user) {
            req.flash("error", "Email or password is incorrect.")
            return res.redirect("/admin/sign-in")
        } else {
            encryptPass = await bcrypt.compare(req.body.password, user.password).then(function(result) {
                if(result == true){
                    updateUser = {
                        _id: user._id,
                        role: user.role,
                        email: user.email
                    }
                    jwt.sign({ updateUser }, process.env.TOKEN_SECRET, { expiresIn: process.env.SESSION_EXPIRY }, (err, token) => {
                        req.session.user = updateUser;
                        console.log(req.session.user);
                        req.session.token = token;
                        return res.redirect("./dashboard")
                    })
                } else {
                    req.flash("error", "Email or password is incorrect.")
                    return res.redirect("/admin/sign-in")
                }
            });
        }
    }).catch (err => {
        console.log(err);
    });
})


/*  ---------------------------------------------  */
/*                    logout                       */
/*  ---------------------------------------------  */
router.get('/logout',  (req, res)=>{
    console.log("req.session.user");
    console.log(req.session.user);
    req.session.destroy((err) => {
        // res.redirect('/home') // will always fire after session is destroyed
        res.send( "user logout" ) 
    })
});
      


      
/*  ---------------------------------------------  */
/*                  Dashboard                      */
/*  ---------------------------------------------  */
router.get("/dashboard", authenticateToken, async(req, res) => {
    total_users    = await User_Model.countDocuments({})
    total_token    = await Token_Model.countDocuments({})
    total_auctions = await Token_Model.countDocuments({Status: "Auctioned"})

    newTokens = await Token_Model.find({}, {Owner_History: 0, File: 0, Description:0, __v: 0, AuctionData: 0}).limit(2).sort({_id: -1})
    .then((result) => {
        console.log( result );
       return result;
    }).catch((err) => {
        return res.json({ err });
    });

    return res.render("amdinStaticFiles/index", {
        total_users,
        total_token,
        total_auctions,
        newTokens,
        loginUser: req.session.user
    })
})

      
/*  ---------------------------------------------  */
/*                  All NFT's                      */
/*  ---------------------------------------------  */
router.get("/tokens", authenticateToken, async(req, res) => {

    Query1 = {}
    if(req.query.status != null) Query1.Status = req.query.status;

    await Token_Model.find( Query1, {Owner_History: 0, File: 0, Description:0, __v: 0, AuctionData: 0}).sort({_id: -1})
    .then((result) => {
        return res.render("amdinStaticFiles/tokens", { tokens: result, loginUser: req.session.user })
        // return res.json({ result });
    }).catch((err) => {
        return res.json({ err });
    });
})



/*  ---------------------------------------------  */
/*                  All User's                     */
/*  ---------------------------------------------  */
router.get("/users", authenticateToken, async(req, res) => {
    await User_Model.find({}, {Activity: 0}).sort({_id: -1})
    .then((result) => {
        console.log(result);
        return res.render("amdinStaticFiles/users", { users: result, loginUser: req.session.user })
    }).catch((err) => {
        return res.json({ err });
    });
})



/*  ---------------------------------------------  */
/*              Token Transfer Report              */
/*  ---------------------------------------------  */
router.get("/transfer-list", authenticateToken, async(req, res) => {
    await Token_Model.find({}, {Activity: 0}).sort({_id: -1})
    .then((result) => {
        console.log(result);
        return res.render("amdinStaticFiles/transferList", { tokens: result, loginUser: req.session.user })
    }).catch((err) => {
        return res.json({ err });
    });
})

/*  ---------------------------------------------  */
/*                  Block User                     */
/*  ---------------------------------------------  */
router.get("/users/:id/:status", authenticateToken, async(req, res) => {

    await User_Model.updateOne({_id: req.params.id}, { status: req.params.status })
    .exec()
    .then((result) => {
        console.log(result);
        res.redirect("/admin/users");
        // return res.render("amdinStaticFiles/users", { users: result, loginUser: req.session.user })
    }).catch((err) => {
        return res.json({ err });
    });
})


 
module.exports = router;