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
  
var multerUploads =  multer({
storage: Storage
})
var cpUpload = multerUploads.fields([{ name: 'File', maxCount: 1}])


/*  ---------------------------------------------  */
/*                    Landing                      */
/*  ---------------------------------------------  */
router.get("/", async (req, res) => {

  viewedData = await Token_Model.aggregate([{ $sample: { size: 6 }}]).then( async(data2) => {
    if(data2){
      return data2
    }     
  }).catch( (err) => {
    return res.status(404).render('404', { userLogin : req.session.user != null ? req.session.user.user_id : undefined});
  })

    res.render("landingPage" , { userLogin:req.session.user != null ? req.session.user.user_id : undefined })
})





module.exports = router