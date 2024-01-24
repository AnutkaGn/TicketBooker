require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// Connecting to a MongoDB database
mongoose.set('strictQuery', true);
mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => console.log("MongoDB conected..."))
    .catch(err => console.log(err))


app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/api', require('./routes/index'));




app.listen(PORT, () => console.log(`Server started on port ${PORT}`));