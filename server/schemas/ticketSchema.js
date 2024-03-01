const mongoose = require('mongoose');
const User = require('./userSchema');
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

ticketSchema.post('findOneAndDelete', async (doc) => {
    const ticketId = doc._id;
    // Оновлення всіх users, які мають цей ticket у своєму масиві tickets
    await User.updateMany({ tickets: {$in: [ticketId]} }, { $pull: { tickets: ticketId } });
  });

const Ticket = mongoose.model("Ticket", ticketSchema);
module.exports = Ticket;