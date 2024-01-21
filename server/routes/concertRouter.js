const express = require('express');
const router = express.Router();
const concertController = require('../controllers/concertController');

//Get all concert
router.get('/', concertController.getConcerts);
//Get concert by Id
router.get('/:id', concertController.getOneConcertById);
//Create new concert
router.post('/', concertController.createConcert);
//Delete concert
router.delete('/:id', concertController.deleteConcert);

module.exports = router;