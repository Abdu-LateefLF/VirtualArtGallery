const express = require('express');
const router = express.Router();
const Joi = require('joi');

const User = require('../models/user.js');
const AppError = require('../AppError.js');
const Gallery = require('../models/gallery.js');

router.get('/', (req, res) => {
    res.render('profile');
});

// Handle updating user information
router.put('/', async (req, res, next) => {
    const schema = Joi.object({
        firstName: Joi.string().required().max(30),
        lastName: Joi.string().required().max(30),
        username: Joi.string().required().max(30)
    });

    const { error } = schema.validate(req.body, { allowUnknown: true });

    try {
        // Ensure that all fields were entered correctly
        if (error) {
            const msg = error.details.map(el => el.message).join(',');
            throw new AppError(msg, 400);
        }

        const foundUser = await User.findOneAndUpdate({ _id: req.user.id }, { ...req.body }, { runValidators: true });

        // Ensure that the user exists
        if (!foundUser) {
            throw new AppError('User Not Found', 500);
        }

        await foundUser.save();

        res.redirect('/profile');

    } catch (e) {
        //req.flash('failure', e.message);
        //res.redirect('/profile');
        res.send(e.message);
    }
});

// Handle user deletion
router.delete('/', async (req, res, next) => {
    try {
        const id = req.user._id;

        await Gallery.findOneAndDelete({ owner: id });

        req.logout(async () => {
            await User.findByIdAndDelete(id);
            res.redirect(`/`);
        });
    } catch (e) {
        //req.flash('failure', e.message);
        //res.redirect('/profile');
        res.send(e.message);
    }
});

module.exports = router;