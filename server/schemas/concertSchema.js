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
        mimetype: {type: String, required: true},
        buffer: {type: mongoose.Schema.Types.Buffer, required: true}
    },
    price:{
        type: Array,
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