const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signUp', userController.signUpUser);
router.post('/logIn', userController.logInUser);
router.post('/add', authMiddleware, userController.addToTickets);
router.delete('/', authMiddleware, userController.deleteFromTickets);

module.exports = router;