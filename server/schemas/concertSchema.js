const mongoose = require('mongoose');
const { Schema } = mongoose;

const concertSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    price:{
        type: String,
        required: true
    },
    venue:{
        type: String,
        required: true
    },
    dateTime:{
        type: Date,
        required: true
    }
});

const Concert = mongoose.model("Concert", concertSchema);
module.exports = Concert;