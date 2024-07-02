const { required, bool } = require('joi');
const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    owner: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    records: [
        {
            recordId: {
                type: String,
                required: true
            },
            userComments: {
                type: String,
                maxLength: 5000
            },
            addedToGallery: {
                type: Boolean,
                default: false
            },
        }
    ],
    sharedTo: [
        { type: mongoose.SchemaTypes.ObjectId, ref: 'user' }
    ],
    created: {
        type: Date
    }
});

const Gallery = mongoose.model('gallery', gallerySchema);

module.exports = Gallery;