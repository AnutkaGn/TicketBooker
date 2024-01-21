const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');

//router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getOneTicketById);
router.get('/', ticketController.getTicketsById); //array id?
router.post('/', ticketController.createTicket);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;