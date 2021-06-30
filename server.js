if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();
const flash = require('connect-flash');
const session = require('express-session');
var cors = require('cors')

/*  ---------------------------------------------  */
/*               Express    Session                */
/*  ---------------------------------------------  */

app.use(session({
  secret: 'mubi',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 600000 * 3 },  // 30 minutes session
}))

/*  ---------------------------------------------  */
/*               Passport  middleware              */
/*  ---------------------------------------------  */

//   C o n n e c t   F l a s h      
app.use(flash());

//   Global Variables for flash Messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error = req.flash('error')
  next();
})


/*  ---------------------------------------------  */
/*                      Mongo DB                   */
/*  ---------------------------------------------  */
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
const db = mongoose.connection;
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected Mongo'))


/*  ---------------------------------------------  */
/*            App Use And Set Methods              */
/*  ---------------------------------------------  */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname));
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname)));
app.use(cors())


/*  ---------------------------------------------  */
/*                Public Routes                    */
/*  ---------------------------------------------  */
const landingPageRouter = require('./routes/landingPage')
app.use(('/'), landingPageRouter);

const homeRouter = require('./routes/index')
app.use(('/home'), homeRouter);


const createNft = require('./routes/creatNFT')
app.use(('/create'), createNft);


const conatct_us = require('./routes/contactsUs')
app.use(('/contact'), conatct_us);

const loginRouter = require('./routes/login')
app.use(('/login'), loginRouter);

const profileRouter = require('./routes/profile')
app.use(('/profile'), profileRouter);

const detailRouter = require('./routes/detail')
app.use(('/detail'), detailRouter);

const updateTokenRouter = require('./routes/updateToken')
app.use(('/update-token'), updateTokenRouter);


/*  ---------------------------------------------  */
/*                Admin  Routes                    */
/*  ---------------------------------------------  */
const adminLoginRouter = require('./routes/admin/index');
app.use(('/admin'), adminLoginRouter);


const launchpad = require('./routes/launchpad')
app.use(('/launchpad'), launchpad);

/*  ---------------------------------------------  */
/*                     404                         */
/*  ---------------------------------------------  */
app.get('*', function (req, res) {
  return res.status(404).render('404');
});


/*  ---------------------------------------------  */
/*                  listening Port                 */
/*  ---------------------------------------------  */
const port1 = 4000
app.listen(process.env.PORT || port1, async () => {
  console.log('Prot is running at : ' + process.env.PORT || port1);
});