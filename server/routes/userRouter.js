const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/signUp', userController.signUpUser);
router.post('/logIn', userController.logInUser);
router.post('/add', userController.addToBasketOrBookedArray);
router.delete('/', userController.deleteFromBasket);

module.exports = router;