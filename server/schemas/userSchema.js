const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    login: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    },
    basket:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ticket'
    }],
    booked:[{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ticket'
    }]
});

const User = mongoose.model("User", userSchema);
module.exports = User;