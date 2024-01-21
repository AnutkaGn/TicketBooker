// createTicket, deleteTicket, GetTickets, GetOneTicketById, GetTicketsById
const Ticket = require('../schemas/ticketSchema');

const getTickets = async(req, res) =>{
    try{
        const tickets = await Ticket.find();
        res.json(tickets);
    }
    catch (error){
        console.error(error);
    }
};

const getTicketsById = async(req, res) =>{
    const {idArray} = req.query;
    return res.json(idArray);
};

const getOneTicketById = async(req, res) =>{

};

const createTicket = async(req, res) =>{

};

const deleteTicket = async(req, res) =>{

};

module.exports = {
    getTickets,
    getTicketsById,
    getOneTicketById,
    createTicket,
    deleteTicket
}