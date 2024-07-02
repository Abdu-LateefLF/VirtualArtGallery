const Joi = require('joi');
const Gallery = require('./models/gallery.js');

module.exports.userSchema = Joi.object({
    firstName: Joi.string().required().max(30),
    lastName: Joi.string().required().max(30),
    username: Joi.string().required().max(30),
    password: Joi.string().required().max(50)
});

module.exports.recordSchema = Joi.object({
    recordId: Joi.string().required(),
    userComments: Joi.string(),
    addedToGallery: Joi.boolean()
});

module.exports.isSharedToUser = async function (ownerId, id) {
    const gallery = await Gallery.findOne({ owner: ownerId, sharedTo: id });
    return gallery !== null;
}

module.exports.hasRecord = async function (userId, id) {
    const gallery = await Gallery.findOne({ owner: userId, 'records.recordId': id });
    return gallery !== null;
}

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}