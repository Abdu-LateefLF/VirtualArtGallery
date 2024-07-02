const express = require('express');
const router = express.Router();
const axios = require('axios');
const havardAPIUtils = require('../HarvardAPIUtils.js');
const passport = require('passport');

const User = require('../models/user.js');
const Gallery = require('../models/gallery.js');
const AppError = require('../AppError.js');
const { userSchema, hasRecord } = require('../Utils.js');

router.get('/', async (req, res) => {
    try {
        const { page = 1,
            search = '',
            sortBy = 'Most Viewed',
            culture = 'All Cultures',
            classification = 'All Classifications'
        } = req.query;

        let sortString = '';
        let sortOrder = 'desc';
        let pageNumber = Number(page);

        switch (sortBy) {
            case 'Most Viewed': sortString = 'totalpageviews'; break;
            case 'Highest Ranking':
                sortString = 'rank';
                sortOrder = 'asc';
                break;
            case 'Most Publications': sortString = 'publicationcount'; break;
        }

        let cultureString = culture === 'All Cultures' ? '' : culture;
        let classString = classification === 'All Classifications' ? '' : classification;

        // Get data to show
        const { data } = await axios.get("https://api.harvardartmuseums.org/object", {
            params: {
                apikey: process.env.HARVARD_KEY,
                title: search,
                culture: cultureString,
                classification: classString,
                hasImage: 1,
                page: pageNumber,
                sort: sortString,
                sortorder: sortOrder,
                size: 30,
            }
        });

        if (req.user) {
            // Mark all records that have already been added to the gallery
            for (let record of data.records) {
                let added = await hasRecord(req.user.id, record.id);

                if (added === true) {
                    record.addedToGallery = true;
                } else {
                    record.addedToGallery = false;
                }
            }
        }

        res.render('home', { data, search, sortBy, culture, classification, page, ...havardAPIUtils });
    } catch (err) {
        next(err);
    }
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    const { error } = userSchema.validate(req.body);

    try {
        // Ensure that all fields were entered correctly
        if (error) {
            const msg = error.details.map(el => el.message).join(',');
            throw new AppError(msg, 400);
        }

        const { firstName, lastName, username, password } = req.body;
        const date = new Date();

        const user = new User({ firstName, lastName, username });
        const registeredUser = await User.register(user, password);

        const newGallery = new Gallery({ owner: user, created: date });
        await newGallery.save();

        // Try to login the user
        req.login(registeredUser, async (err) => {
            if (err) {
                res.redirect('/login');
            } else {
                //req.flash('success', 'Your Account Was Successfully Created!');
                res.redirect('/');
            }
        });
    } catch (err) {
        next(err);
        //req.flash('failure', e.message);
        //res.redirect('/register');
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', passport.authenticate('local', { failureFlash: false, failureRedirect: '/login' }), (req, res) => {
    console.log('Successful Login!');
    res.redirect('/');
});


router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const { data } = await axios.get(`https://api.harvardartmuseums.org/object/${id}`, {
        params: {
            apikey: process.env.HARVARD_KEY,
        }
    });

    if (data) {
        const record = data;
        res.render('viewRecord', { record });
    } else {
        res.send('Page not found');
    }
})

module.exports = router;