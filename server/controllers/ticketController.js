// getTickets, getTicketsById, createTicket, bookTicket, bookManyTickets, deleteTicket, deleteNotBookedTicket
const ApiError = require('../error/ApiError');
const Ticket = require('../models/ticketModel');
const mongoose = require('mongoose')

const getTickets = async (req, res, next) =>{
    try{
        const tickets = await Ticket.find({concertId: req.params.id});
        if (!tickets) return next(ApiError.badRequest(`Ticket with ID ${req.params.id} not found`));
        return res.status(200).json({tickets});
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const getTicketsById = async (req, res, next) =>{
    try{
        const {tickets} = req.user;
        const userTickets = await Ticket.find({_id:{$in: tickets}});
        if (!userTickets) return next(ApiError.badRequest(`Ticket with ID ${tickets} not found`));
        return res.status(200).json({userTickets});
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const getTicketId = async (req, res, next) => {
    try {
        const { concertId, seat, row, floor } = req.query;
        const ticket = await Ticket.findOne({concertId: concertId, row: row, seat: seat, floor: floor});
        if (!ticket) return next(ApiError.badRequest(`Ticket  not found`));
        return res.status(200).json({id: ticket._id});
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
}

const getTicketPrice = async (req, res, next) => {
    try {
        const { id } = req.query;
        const ticket = await Ticket.findById(id);
        if (!ticket) return next(ApiError.badRequest(`Ticket  not found`));
        return res.status(200).json({price: ticket.price});
    } catch (error) {
        console.error(error);
        return res.status(500);
    }
}

const createTicket = async (req, res) =>{
    try{
        const {concertId, row, seat, price, floor} = req.body;
        const newTicket = await Ticket.create({concertId, row, seat, price, floor});
        return res.status(200).json({newTicket})
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const bookTicket = async (req, res, next) =>{
    try{
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, {booked: true}, {new: true});
        if (!ticket) return next(ApiError.badRequest(`Ticket with ID ${req.params.id} not found`));
        return res.status(200).json({ticket})
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const bookManyTickets = async (req, res) =>{
    try{
        const {idArray} = req.query;
        const ids = idArray.split(',').map(id => mongoose.Types.ObjectId(id.trim()));
        const tickets = await Ticket.updateMany({_id:{$in:ids}}, {booked: true}, {new: true});
        return res.status(200).json({tickets})
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const deleteTicket = async (req, res) =>{
    try{
        const { id } = req.params;
        const deletedTicket = await Ticket.findByIdAndDelete(id);
        return res.status(200).json({deletedTicket});
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
    
};

const deleteNotBookedTicket = async () =>{
    //отримати ті, що почалися + 0,5 години
    // отримати квитки на ці концерти, які не заброньовані та видалити 
};

module.exports = {
    getTickets,
    getTicketsById,
    getTicketId,
    getTicketPrice,
    createTicket,
    bookTicket,
    deleteTicket,
    bookManyTickets,
    deleteNotBookedTicket
}