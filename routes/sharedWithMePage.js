const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Gallery = require('../models/gallery.js');
const AppError = require('../AppError.js');


router.get('/', async (req, res) => {
    const sharedGalleries = await Gallery.find({ sharedTo: req.user._id });

    for (let gallery of sharedGalleries) {
        await gallery.populate('owner');
    }

    res.render('sharedWithMe', { sharedGalleries });
});

module.exports = router;