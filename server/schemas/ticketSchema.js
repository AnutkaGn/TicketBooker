const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
    concertId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Concert',
        required: true
    },
    row:{
        type: Number,
        required: true
    },
    seat:{
        type: Number,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    floor:{
        type: String,
        enum: ['parterre', 'balcony', 'leftLoggia', 'rightLoggia'],
        required: true
    },
    booked:{
        type: Boolean,
        default: false
    }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;