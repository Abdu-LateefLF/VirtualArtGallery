if (process.env.NODE_ENV !== "production") require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { isLoggedIn } = require('./Utils.js');

const homeRoutes = require('./routes/homePage.js');
const galleryRoutes = require('./routes/galleryPage.js');
const profileRoutes = require('./routes/profilePage.js');
const sharedWithMeRoutes = require('./routes/sharedWithMePage.js');

const User = require('./models/user.js');

// Connect to mongodb
const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl).then(() => {
    console.log('Mongo Connection Successful!');
}).catch(err => {
    console.error('Mongo Connection Error:', err);
});

// Create our mongo store
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.ST_SCRT
    }
});

const sessionConfig = {
    secret: process.env.SS_SCRT,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(methodOverride('_method'));
app.use(mongoSanitize());
app.use(session(sessionConfig));

// Parsing
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(methodOverride('_method'));

// Serve Static Assets
app.use(express.static(__dirname + '/public'));

// Passport init
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Pass user object to our views
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Routes
app.use('/shared', isLoggedIn, sharedWithMeRoutes);
app.use('/profile', isLoggedIn, profileRoutes);
app.use('/gallery', isLoggedIn, galleryRoutes);
app.use('/', homeRoutes);

// Error Handler
app.use((err, req, res, next) => {
    const { status = 500, message = 'Something Went Wrong' } = err;
    res.status(status).send(message);
});

// Catch invalid requests
app.use((req, res) => {
    res.status(404).send('No page found!');
});

// Start the server
app.listen(3000, () => {
    console.log("Started server on port 3000");
});
