const jwt = require("jsonwebtoken");
      
/*  ---------------------------------------------  */
/*             Authenticate Token                  */
/*  ---------------------------------------------  */
function authenticateToken(req, res, next) {
    const token = req.session.token;  
    if (token == null){
        req.flash("error", "Please login.")
        return res.redirect("/admin/sign-in")
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        console.log(err)
        if (err) {
            req.flash("error", "Session expired, login again.")
            return res.redirect("/admin/sign-in")
        }
      req.user = user
      next()
    })
}


module.exports = authenticateToken;



//  its for admin session only.