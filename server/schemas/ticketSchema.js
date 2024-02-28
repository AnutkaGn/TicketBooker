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
        type: Number
    },
    floor:{
        type: String,
        enum: ['parterre', 'balcony', 'leftLoggia', 'rightLoggia', 'mezzanineLoggia1', 'mezzanineLoggia2', 'mezzanineLoggia3', 'mezzanineLoggia4', 'mezzanineLoggia5', 'mezzanineLoggia6', 'balconyLoggia1', 'balconyLoggia2', 'balconyLoggia3', 'balconyLoggia4', 'balconyLoggia5', 'balconyLoggia6', 'baignoire1', 'baignoire2'],
        required: true
    },
    booked:{
        type: Boolean,
        default: false
    }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;