const mongoose = require('mongoose');
const { Schema } = mongoose;

const ticketSchema = new Schema({
    concertId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Concert',
        required: true
    },
    description:{
        type: String,
        required: true
    },
    row:{
        type: String,
        required: true
    },
    seat:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    floor:{
        type: String,
        required: true
    },
    booked:{
        type: Boolean,
        required: true
    }
});

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;