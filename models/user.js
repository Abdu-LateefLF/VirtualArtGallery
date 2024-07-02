const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Gallery = require('./gallery');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        maxLength: 30,
        required: true
    },
    lastName: {
        type: String,
        maxLength: 30,
        required: true
    },
    username: {
        type: String,
        maxLength: 30,
        required: true
    },
    password: {
        type: String,
    }
});

// Find all galleries that have been shared to this user and remove the user from thier list
userSchema.post('findByIdAndDelete', async function (data) {
    console.log('User id:', data._id);
    const galleries = await Gallery.find({ sharedTo: data._id });

    for (let gallery of galleries) {
        gallery.sharedTo.splice(gallery.sharedTo.indexOf(data._id), 1);
        await gallery.save();
    }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model('user', userSchema);

module.exports = User;