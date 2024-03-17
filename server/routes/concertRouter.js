const express = require('express');
const router = express.Router();
const concertController = require('../controllers/concertController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const multer = require('multer');
const upload = multer({storage: multer.memoryStorage()});

//Get all concert
router.get('/', concertController.getConcerts);
//Get concert by Id
router.get('/:id', concertController.getOneConcertById);
//Create new concert
router.post('/', authMiddleware, checkRoleMiddleware, upload.single("image"), concertController.createConcert);
//Delete concert
router.delete('/:id', authMiddleware, checkRoleMiddleware, concertController.deleteConcert);

module.exports = router;