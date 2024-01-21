// createConcert, deleteConcert, getConcerts (all, byType, byDate, byVenue), getOneConcertById
const Concert = require('../schemas/concertSchema');

const getConcerts = async(req, res) =>{
    try{
        let concerts
        let { type, date, venue } = req.query;
        const query = {};
        if (type) {
            query.type = type;
        }
        if (date) {
            query.date = date;
        }
        if (venue) {
            query.venue = venue;
        }
        if (!type && !date && !venue){
            concerts = await Concert.find();
        }else {
            console.log("Ok")
            concerts = await Concert.find(query);
        }
        return res.json(concerts);
    }
    catch (error){
        console.error(error);
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
    }
};

const deleteConcert = async(req, res) =>{
    try{
        const { id } = req.params;
        await Concert.deleteOne({_id: id});
        return res.json("The concert has been removed");
    }
    catch (error){
        console.error(error);
    }
};
module.exports = {
    getConcerts,
    getOneConcertById,
    createConcert,
    deleteConcert
}

