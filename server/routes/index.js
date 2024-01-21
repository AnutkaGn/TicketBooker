const express = require('express');
const router = express.Router();
const userRouter = require('./userRouter');
const ticketRouter = require('./ticketRouter');
const concertRouter = require('./concertRouter');

router.use('/user', userRouter);
router.use('/concert', concertRouter);
router.use('/ticket', ticketRouter);

module.exports = router;