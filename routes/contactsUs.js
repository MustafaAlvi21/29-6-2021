const router = require("express").Router();

router.get('/', (req, res) => {
    res.render("contactsUs", { userLogin: req.session.user != null ? req.session.user : undefined });
});

module.exports = router