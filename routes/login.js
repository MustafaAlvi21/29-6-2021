const router = require("express").Router();
const passport = require('passport');
const multer = require("multer");
const path = require("path")
const fs = require("fs")
const Token_Model = require("../model/token");
const User_Model = require("../model/users");
// const userStatusOnLogin = require("../middlewares/chechStatusOnLogin");



/*  ---------------------------------------------  */
/*                Global login                     */
/*  ---------------------------------------------  */
router.get("/getUser", (req, res) => {
    return res.json({ userLogin : req.session.user != null ? req.session.user.user_wallet : undefined })
});


/*  ---------------------------------------------  */
/*                    logout                       */
/*  ---------------------------------------------  */
router.get('/logout',  (req, res)=>{

    console.log("req.session.user");
    console.log(req.session.user);
    req.session.destroy((err) => {
        res.redirect('/home') // will always fire after session is destroyed
    })
});
      

router.post('/', async (req, res) => {
    await User_Model.findOne({
      user_wallet: req.body.user_wallet
    }, { Activity: 0 , __v : 0 }).then( async user => {
    
        console.log("------------------------------------------");
        console.log("           Config passport                ");
        console.log(user);
        console.log("------------------------------------------");
    
      if (!user) {
        let newUser = await new User_Model({
            user_wallet : req.body.user_wallet,
            user_id : req.body.user_wallet
        })
        .save()
        .then((result) => {
            console.log("User register:");
            console.log(result);
            return result;
        }).catch((err) => {
            console.log(err);
            return err;
        });
        req.session.user = newUser;

        var unixTimestamp = Date.now();
        var date = new Date(unixTimestamp);
        newDate = date.getDate()+ "/"+(date.getMonth()+1)+ "/"+date.getFullYear()+ " "+date.getHours()+ ":"+date.getMinutes()+ ":"+date.getSeconds();
    
        await User_Model.updateOne({ "user_wallet" : newUser.user_wallet }, 
        {$push:{Activity : {$each:[{ 
            "message" : "Account Creation", 
            "timestamp": Date.now(), 
            "Date" : newDate
        } ], $position:0}}}
        )
        .exec()
        .then( data => {
            console.log(data);
        })
        .catch( err => {
            console.log(err);
        })


        return res.json(req.session.user)
    } else {


        if(user.status == "Active"){
            req.session.user = user;
            return res.json(req.session.user)                
        } else {
            // req.flash("error", "You are blocked by Admin, contact to support.")
            // res.redirect("/home")
            // setTimeout(() => {
            //     req.session.destroy()
            // }, 2000);


            return res.json({error: "You are blocked by Admin, contact to support."})                
        }

    }
    
    }).catch (err => {
        console.log(err);
    });

  

})


    
    



module.exports = router;





