const router = require("express").Router();
const multer = require("multer");
const path = require("path")
const fs = require("fs")
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
        cb(null, file.originalname + "_" + Date.now() + path.extname(file.originalname))
    }
});

var multerUploads = multer({
    storage: Storage
})
var cpUpload = multerUploads.fields([{ name: 'File', maxCount: 1 }])


/*  ---------------------------------------------  */
/*                      Home                       */
/*  ---------------------------------------------  */
router.get('/', (req, res) => {
    console.log('search = ' + req.body.search)

    const page = req.query.cat;
    res.render("index", { userLogin: req.session.user != null ? req.session.user : undefined });
    //console.log('req', req);
    //_getAllFilterData(req);
});
// router.get('/search', (req, res) => {
//     //console.log('reqHIIIIIIIIIIIIIIIIIIII');
//     //console.log('req', req.params.query);
//     res.render("index", { userLogin: req.session.user != null ? req.session.user : undefined })
// });

router.get('/itemsForSale', paginatedResults(Token_Model), async (req, res) => {
    res.json(res.paginatedResults)
});


/*  ---------------------------------------------  */
/*                   My Tokens                     */
/*  ---------------------------------------------  */
router.get('/myTokens/:account', paginatedResults(Token_Model,), async (req, res) => {
    //console.log(res.paginatedResults);
    data = res.paginatedResults
    res.json({ myTokens: data })
});



/*  ---------------------------------------------  */
/*                Save Token Data                  */
/*  ---------------------------------------------  */
// Yay route is liay k jb blockchain main data save hojai ga to uski aik copy hamare pass bhi save hogi database main
router.post("/saveToData", async (req, res) => {
    //console.log("saveToData");
    //console.log(req.body);

    // token_id = await Token_Model.countDocuments({})

    ownership = {
        owner: req.body.account,
        timestamp: Date.now()
    }

    console.log('req.body', req.body);

    newToken = await new Token_Model({
        Status: req.body.Status,
        Creator: ownership,
        Owner: ownership,
        Owner_History: ownership,
        File: req.body.File,
        Title: req.body.Name,
        Description: req.body.Description,
        Token_ID: req.body.tokenId,
        Token_Price: req.body.Price,
        Token_PriceInWei: req.body.PriceInWei,
        URL: req.body.path,
        externalLink: req.body.externalLink,
        Category: req.body.Category,
        thumb: req.body.thumb,
        nftType: req.body.nftType,
        timestamp: Date.now(),

    }).save().then((result) => {
        //console.log(result);
        return result;
    }).catch(async (err) => {
        //console.log(err);
        await deleteUploadedFiles(req.body.File)
        res.send(err)
    });


    var unixTimestamp = Date.now();
    var date = new Date(unixTimestamp);
    newDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    await User_Model.updateOne({ "user_wallet": req.body.account },
        {
            $push: {
                Activity: {
                    $each: [{
                        "message": "Token Creation",
                        "timestamp": Date.now(),
                        "Title": req.body.Name,
                        "Token_ID": req.body.tokenId,
                        "Status": req.body.Status,
                        "Date": newDate
                    }], $position: 0
                }
            }
        }
    )
        .exec()
        .then(data => {
            //console.log(data);
        })
        .catch(err => {
            //console.log(err);
        })
    return res.json(newToken);
})


/*  ---------------------------------------------  */
/*                  Filter API                     */
/*  ---------------------------------------------  */

router.get('/filter/:query', async (req, res) => {
    var query = JSON.parse(req.params.query);

    //console.log("req.query.page");
    //console.log(req.query.page);
    sort = 0;
    if (typeof query.sort != "undefined") {
        sort = parseInt(query.sort[1])
        sortType = query.sort[0]
    } else {
        sort = 1
        sortType = "timestamp"
    }
    query.sort

    const results = {}

    const page = parseInt(req.query.page)
    //console.log(page);

    const totalSupply = await Token_Model.countDocuments().exec();
    //console.log("totalSupply: " + totalSupply);

    const limit = 6

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    if (endIndex < parseInt(totalSupply)) {
        results.next = {
            page: page + 1,
            limit: limit
        }
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        }
    }

    results.limit = limit;
    results.totalSupply = totalSupply;

    // try {
    //     results.results = await Token_Model.find().limit(limit).skip(startIndex).exec()
    //     res.paginatedResults = results
    //     next()
    // } catch (e) {
    //     res.status(500).json({ message: e.message })
    // }


    // ----------------------------------------------------------------------------------------------------------------------






    if (typeof query.Category != 'undefined' && query.Category.length > 0) {
        if (typeof query.Category != 'undefined' && sortType == "Token_Price") {

            data = await Token_Model.find({ Category: { $in: query.Category } })
                .sort({ "Token_Price": sort }).limit(limit).skip(startIndex)
                .then((result) => {
                    //console.log("with category");
                    //console.log(result);
                    return result;
                }).catch((err) => {
                    //console.log(err);
                });
            return res.json({ data, results });

        } else if (typeof query.Category != 'undefined' && sortType == "timestamp") {

            data = await Token_Model.find({ Category: { $in: query.Category } })
                .sort({ "timestamp": sort }).limit(limit).skip(startIndex)
                .then((result) => {
                    //console.log("with category");
                    return result;
                }).catch((err) => {
                    //console.log(err);
                });
            return res.json({ data, results });

        } else if (typeof query.Category != 'undefined' && sortType == "viewed") {

            data = await Token_Model.find({ Category: { $in: query.Category } })
                .sort({ "views": sort }).limit(limit).skip(startIndex)
                .then((result) => {
                    //console.log("with category");
                    return result;
                }).catch((err) => {
                    //console.log(err);
                });
            return res.json({ data, results });

        } else {

            data = await Token_Model.find({ Category: { $in: query.Category }, Status: "Auctioned" }).limit(limit).skip(startIndex)
                .then((result) => {
                    //console.log("with category");
                    return result;
                }).catch((err) => {
                    //console.log(err);
                });
            return res.json({ data, results });

        }
    } else {

        if (typeof query.Category == 'undefined' && sortType == "Token_Price") {

            data = await Token_Model.find({})
                .sort({ "Token_Price": sort }).limit(limit).skip(startIndex)
                .then((result) => {
                    //console.log("No category 1");
                    //console.log(result);
                    //console.log(result);
                    return result;
                }).catch((err) => {
                    //console.log(err);
                });
            return res.json({ data, results });

        } else if (typeof query.Category == 'undefined' && sortType == "timestamp") {

            data = await Token_Model.find({})
                .sort({ "timestamp": sort }).limit(limit).skip(startIndex)
                .then((result) => {
                    //console.log("No category 2");
                    //console.log(result);
                    return result;
                }).catch((err) => {
                    //console.log(err);
                });
            return res.json({ data, results });

        } else if (typeof query.Category == 'undefined' && sortType == "viewed") {

            data = await Token_Model.find({})
                .sort({ "views": sort }).limit(limit).skip(startIndex)
                .then((result) => {
                    //console.log("No category 2");
                    //console.log(result);
                    return result;
                }).catch((err) => {
                    //console.log(err);
                });
            return res.json({ data, results });

        } else {

            data = await Token_Model.find({ Status: "Auctioned" }).limit(limit).skip(startIndex)
                .then((result) => {
                    //console.log("No category 3");
                    return result;
                }).catch((err) => {
                    //console.log(err);
                });
            return res.json({ data, results });

        }

    }
});


/*  ---------------------------------------------  */
/*               Update Token Status               */
/*  ---------------------------------------------  */
router.get("/updateTokenStatus/:TokenId/:TokenStatus", userStatus, async (req, res) => {
    await Token_Model.updateOne({ Token_ID: req.params.TokenId },
        { $set: { Status: req.params.TokenStatus } }).exec().then((result) => {
            //console.log(result);
            return res.json(result)
        }).catch((err) => {
            //console.log(err);
            return res.json(err)
        });
})


/*  ---------------------------------------------  */
/*              Update Token Purchase              */
/*  ---------------------------------------------  */
router.get("/updateTokenPrice/:TokenID/:TokenPrice", userStatus, async (req, res) => {
    await Token_Model.updateOne({ Token_ID: req.params.TokenID }, { Token_Price: req.params.TokenPrice })
        .exec().then((result) => {
            //console.log(result);
            return res.json(result)
        }).catch((err) => {
            //console.log(err);
            return res.json(err)
        });

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
                        "Token_ID": req.params.TokenID,
                        "Price": req.params.TokenPrice,
                        "Date": newDate
                    }], $position: 0
                }
            }
        }
    )
        .exec()
        .then(data => {
            //console.log(data);
        })
        .catch(err => {
            //console.log(err);
        })
})


/*  ---------------------------------------------  */
/*                  Token Purchase                 */
/*  ---------------------------------------------  */
router.get("/purchaseToken/:TokenID_Purchase/:account/:TokenPrice_Purchase", userStatus, async (req, res) => {

    ownership_history = await Token_Model.findOne({ Token_ID: req.params.TokenID_Purchase }, { Owner_History: 1, Owner: 1 }).then((result) => {
        //console.log(result);
        return result;
    }).catch((err) => {
        //console.log(err);
        return err;
    });
    Owner_History = [
        {
            owner: req.params.account, timestamp: Date.now(),
        }, ...ownership_history.Owner_History,
    ]

    //console.log("Owner_History");
    //console.log(Owner_History);
    await Token_Model.updateOne({ Token_ID: req.params.TokenID_Purchase },
        {
            Token_Price: req.params.TokenPrice_Purchase,
            Status: "Not for Sale",
            Owner: {
                owner: req.params.account,
                timestamp: Date.now()
            },
            $set: { 'Owner_History': Owner_History }
        }
    )
        .exec().then((result) => {
            //console.log(result);
        }).catch((err) => {
            //console.log(err);
            res.status(400).render("404")
        });


    var unixTimestamp = Date.now();
    var date = new Date(unixTimestamp);
    newDate = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    // update buyer activity
    await User_Model.updateOne({ "user_wallet": req.session.user.user_wallet },
        // { "$push": { 
        //     "Activity": { 
        //     } }}

        {
            $push: {
                Activity: {
                    $each: [{
                        "message": "Token purchase successful",
                        "timestamp": Date.now(),
                        "Token_ID": req.params.TokenID_Purchase,
                        "Price": req.params.TokenPrice_Purchase,
                        "Date": newDate
                    }], $position: 0
                }
            }
        }
    )
        .exec()
        .then(data => {
            //console.log(data);
        })
        .catch(err => {
            //console.log(err);
        })


    // update seller activity
    await User_Model.updateOne({ "user_wallet": ownership_history.Owner.owner },
        // { "$push": { 
        //     "Activity": { 
        //     } }}

        {
            $push: {
                Activity: {
                    $each: [{
                        "message": "Token sell successful",
                        "timestamp": Date.now(),
                        "Token_ID": req.params.TokenID_Purchase,
                        "Price": req.params.TokenPrice_Purchase,
                        "Date": newDate
                    }], $position: 0
                }
            }
        }
    )
        .exec()
        .then(data => {
            //console.log(data);
        })
        .catch(err => {
            //console.log(err);
        })


    // req.flash("success_msg", "You have purchase this token");
    res.json({ "success_msg": "You have purchase this token" })
})


/*  ---------------------------------------------  */
/*                Paginated Results                */
/*  ---------------------------------------------  */
function paginatedResults(model) {
    return async (req, res, next) => {
        const results = {}

        const page = parseInt(req.query.page)
        //console.log(page);

        const totalSupply = await model.countDocuments().exec();
        //console.log("totalSupply: " + totalSupply);

        const limit = 6

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        if (endIndex < parseInt(totalSupply)) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }

        results.limit = limit;
        results.totalSupply = totalSupply;

        try {
            results.results = await model.find().limit(limit).skip(startIndex).exec()
            res.paginatedResults = results
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}



/*  ---------------------------------------------  */
/*              Delete Uploaded Files              */
/*  ---------------------------------------------  */
async function deleteUploadedFiles(params) {
    if (typeof params != 'undefined' && params.length > 0) {
        fs.unlink(params, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
    }
    return true;
}


/*  ---------------------------------------------  */
/*                     Search                      */
/*  ---------------------------------------------  */
router.get('/search', async (req, res) => {
    let productData;
    result = []
    //console.log('<<  S E A R C H  >> ')
    // //console.log('search = ' + req.body.search) 
    searchData = await Token_Model.find({
        $and: [
            {
                $or: [
                    { "Title": { $regex: req.query.name, $options: "i" } },
                ]
            }
        ]
    }, { File: 1, Title: 1, Token_ID: 1, Token_Price: 1, URL: 1, Category: 1, Status: 1 }).then((data) => {
        if (data) {
            console.log('\n')
            console.log('<<  SEARCH  FOUND  >> ')
            console.log(data)
        }

        res.render("index", { userLogin: req.session.user != null ? req.session.user : undefined });
        //return res.json({ data })
        // return data;
    }).catch((err) => {
        // return res.status(404).render('404');
    });
})





module.exports = router;