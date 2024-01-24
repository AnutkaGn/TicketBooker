const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

// Get ticket by concert ID
router.get('/:id', ticketController.getTickets);
// Get tickets by array of ID
router.get('/', authMiddleware, ticketController.getTicketsById);
// Create ticket
router.post('/', authMiddleware, ticketController.createTicket);
// Book ticket (booked: true)
router.put('/:id', authMiddleware, ticketController.bookTicket);
// Book tickets ([booked: true])
router.put('/', authMiddleware, ticketController.bookManyTickets);
router.delete('/:id', authMiddleware, ticketController.deleteTicket);

module.exports = router;