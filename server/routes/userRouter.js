const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Registration of a new user
router.post('/signUp', userController.signUpUser);
// LogIn user
router.post('/logIn', userController.logInUser);
// Add tickets to the array of user tickets (basket)
router.post('/add', authMiddleware, userController.addToTickets);
// Delete tickets from the array of user tickets (basket)
router.delete('/', authMiddleware, userController.deleteFromTickets);

module.exports = router;