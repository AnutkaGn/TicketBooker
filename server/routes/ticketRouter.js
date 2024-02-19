const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/authMiddleware');

// Get tickets by concert ID
router.get('/concertId/:id', ticketController.getTickets);
// Get tickets by array of ID
router.get('/', authMiddleware, ticketController.getTicketsById);
// Get ticket id by concertId, row, seat and floor
router.get('/getId', authMiddleware, ticketController.getTicketId);
// Get ticket price by id
router.get('/getPrice', authMiddleware, ticketController.getTicketPrice);
// Create ticket
router.post('/', authMiddleware, ticketController.createTicket);
// Book ticket (booked: true)
router.put('/:id', authMiddleware, ticketController.bookTicket);
// Book tickets ([booked: true])
router.put('/', authMiddleware, ticketController.bookManyTickets);
// Delete ticket from database
router.delete('/:id', authMiddleware, ticketController.deleteTicket);

module.exports = router;