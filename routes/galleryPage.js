const express = require('express');
const router = express.Router();
const axios = require('axios');

const User = require('../models/user.js');
const Gallery = require('../models/gallery.js');
const AppError = require('../AppError.js');

const { recordSchema, hasRecord, isSharedToUser } = require('../Utils.js');
const havardAPIUtils = require('../HarvardAPIUtils.js');

router.get('/', async (req, res, next) => {
    try {
        const { view = '' } = req.query;

        // Check if we are viewing our own gallery or another user's gallery
        const userId = view !== '' ? view : req.user._id;

        let records = {};
        let comments = {};

        const gallery = await Gallery.findOne({ owner: userId });

        if (gallery?.records.length > 0) {

            const ids = gallery.records.map((record) => {
                comments[record.recordId] = record.userComments;
                return record.recordId;
            }).join('|');

            const { data } = await axios.get('https://api.harvardartmuseums.org/object/', {
                params: {
                    apikey: process.env.HARVARD_KEY,
                    id: ids
                }
            });

            records = data?.records;

            for (let record of records) {
                record.userComments = comments[record.id];
            }
        }

        await gallery.populate('owner');

        const isAuthor = userId === req.user._id;

        res.render('gallery', { gallery, records, isAuthor, ...havardAPIUtils });
    } catch (e) {
        next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const { id, comment } = req.body;
        const user = req.user;

        // Check if the id already exists in the gallery
        const recordExist = await hasRecord(user._id, id);

        const gallery = await Gallery.findOne({ owner: user._id });

        if (recordExist) throw new AppError('This record is already in the gallery!');

        const newRecord = { recordId: id, userComments: comment, addedToGallery: true };

        // Ensure that all fields were entered correctly
        const { error } = recordSchema.validate(newRecord);
        if (error) {
            const msg = error.details.map(el => el.message).join(',');
            throw new AppError(msg, 400);
        }

        gallery.records.push(newRecord);
        await gallery.save();

        res.send();

    } catch (e) {
        res.send(e);
    }
})

router.get('/user', async (req, res) => {
    try {
        const { search } = req.query;
        const user = await User.findOne({ username: search });

        console.log(user);
        console.log(req.user);

        if (!user || user?.username === req.user.username) throw new AppError('User does not exist!');

        const alreadyAdded = await isSharedToUser(req.user._id, user._id);
        if (alreadyAdded) throw new AppError('This Gallery is already shared to this user!');

        const { username } = user;

        res.send({ username });
    } catch (err) {
        res.send({ err });
    }
});

router.post('/user', async (req, res) => {
    try {
        const { username } = req.body;

        if (username === req.user.username) throw new AppError('You cannot share your Gallery to yourself!');

        const user = await User.findOne({ username: username });
        const gallery = await Gallery.findOne({ owner: req.user._id });

        if (!user) throw new AppError('User does not exist!');

        const alreadyAdded = await isSharedToUser(req.user._id, user._id);
        if (alreadyAdded) {
            console.log('Already added!');
            throw new AppError('This Gallery is already shared to this user!');
        }

        gallery.sharedTo.push(user);

        await gallery.save();

        res.send();
    } catch (err) {
        res.send({ err });
    }
});

router.delete('/user', async (req, res) => {
    try {
        const { username } = req.query;

        const user = await User.findOne({ username: username });
        const gallery = await Gallery.findOne({ owner: req.user._id });

        if (!gallery.sharedTo.includes(user._id)) {
            throw new AppError('Not Shared With This User!');
        }

        gallery.sharedTo.splice(gallery.sharedTo.indexOf(user._id), 1);

        await gallery.save();

        res.send('Successfully saved!');
    } catch (err) {
        console.log(err.message);
        res.send({ err });
    }
});

router.get('/users', async (req, res) => {
    const gallery = await Gallery.findOne({ owner: req.user._id });

    if (gallery) {
        await gallery.populate('sharedTo');

        const usernames = gallery.sharedTo.map(user => user.username);

        res.send({ usernames });
    } else {
        res.send();
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const gallery = await Gallery.findOne({ owner: user._id });

        gallery.records = gallery.records.filter((rec) => rec.recordId !== id);

        await gallery.save();

        res.redirect('/gallery');
    } catch (e) {
        next(e);
    }
});

module.exports = router;
