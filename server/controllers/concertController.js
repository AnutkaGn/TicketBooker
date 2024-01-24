// createConcert, deleteConcert, getConcerts (all, byType, byDate, byVenue), getOneConcertById
const Concert = require('../schemas/concertSchema');
const Ticket = require('../schemas/ticketSchema');

const getConcerts = async(req, res) =>{
    try{
        let concerts = []
        let { type, date, venue } = req.query;
        if (!type && !date && !venue){
            concerts = await Concert.find();
        } else {
            const query = {};
            if (type) query.type = type;
            if (date) query.date = date;
            if (venue) query.venue = venue;
            concerts = await Concert.find(query);
        }
        console.log(req.headers);
        return res.json(concerts);
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const getOneConcertById = async(req, res) =>{
    try{
        const { id } = req.params
        const concert = await Concert.findById(id);
        return res.json(concert);
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
    
};

const createConcert = async(req, res) =>{
    try{
        const { name, description, type, image, price, venue, dateTime } = req.body;
        const concert = await Concert.create({ name, description, type, image, price, venue, dateTime });
        return res.json({concert})
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const deleteConcert = async(req, res) =>{
    try{
        const { id } = req.params;
        const concert = await Concert.findById(id)
        if(!concert) {
            return res.status(404).json(`There are no concerts with id ${id}`)
        }
        await Concert.deleteOne({_id: id});
        return res.json("The concert has been removed");
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};
module.exports = {
    getConcerts,
    getOneConcertById,
    createConcert,
    deleteConcert
}

