const mongoose = require('mongoose');
const connection = require('../libs/connection');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.ObjectId,
        required: true,
    },
    subcategory: {
        type: mongoose.ObjectId,
        required: true,
    },
    images: [String],
});

module.exports = connection.model('Product', productSchema);
