const User_Model = require("../model/users");

/*  ---------------------------------------------  */
/*                   User Status                   */
/*  ---------------------------------------------  */
async function userStatus(req, res, next) {
    const user = req.session.user;
    if(typeof req.session.user.user_id != "undefined"){
        await User_Model.findOne({ user_id: req.session.user.user_id })
        .then((result) => {
    
            if(result.status == "Active"){
                next()
            } else {
                req.flash("error", "You are blocked by Admin, contact to support.")
                res.redirect("/home")
                setTimeout(() => {
                    req.session.destroy()
                }, 2000);
            }
    
        }).catch((err) => {
                console.log(err);
                req.flash("error", "There is some error.")
                res.redirect("/home")
                setTimeout(() => {
                    req.session.destroy()
                }, 2000);
        });
    } else {
        req.flash("error", "There is some error.")
        res.redirect("/home")
        setTimeout(() => {
            req.session.destroy()
        }, 2000);
    }
}


module.exports = userStatus;



// check kerne k liay k user ko admin nay block kia ho to user login na ho