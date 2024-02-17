// getTickets, getTicketsById, createTicket, bookTicket, bookManyTickets, deleteTicket, deleteNotBookedTicket
const ApiError = require('../error/ApiError');
const Ticket = require('../schemas/ticketSchema');
const User = require('../schemas/userSchema');

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
        const tickets = await Ticket.updateMany({_id:{$in:idArray}}, {booked: true}, {new: true});
        return res.status(200).json({tickets})
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const deleteTicket = async (req, res) =>{
    try{
        const { id } = req.params.id;
        await Ticket.findByIdAndDelete(id);
        const user = req.user;
        const { tickets } = await User.findOneAndUpdate({login: user.login}, {$pull: {tickets: id}}, {new: true});
        return res.status(200).json({tickets});
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
    createTicket,
    bookTicket,
    deleteTicket,
    bookManyTickets,
    deleteNotBookedTicket
}