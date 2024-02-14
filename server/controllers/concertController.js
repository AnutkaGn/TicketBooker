// getConcerts, getOneConcertById, createConcert, deleteConcert
const ApiError = require('../error/ApiError');
const Concert = require('../schemas/concertSchema');

const getConcerts = async(req, res) =>{
    try{
        let concerts = []
        let { type, dateTime, venue } = req.query;
        if (!type && !dateTime && !venue){
            concerts = await Concert.find();
        } else {
            const query = {};
            if (type) query.type = type;
            if (dateTime) query.dateTime = { $gte: new Date(dateTime), $lt: new Date(new Date(dateTime).getFullYear(), new Date(dateTime).getMonth(),new Date(dateTime).getDate()+1)};
            if (venue) query.venue = venue;
            concerts = await Concert.find(query);
        }
        return res.status(200).json(concerts);
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const getOneConcertById = async(req, res, next) =>{
    try{
        const { id } = req.params
        const concert = await Concert.findById(id);
        if (!concert) return next(ApiError.badRequest(`Concert with ID ${id} not found`))
        return res.status(200).json(concert);
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
        return res.status(200).json({concert})
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

const deleteConcert = async(req, res, next) =>{
    try{
        const { id } = req.params;
        const concert = await Concert.findById(id);
        if(!concert) {
            return next(ApiError.badRequest(`There are no concerts with id ${id}`));
        }
        await Concert.deleteOne({_id: id});
        return res.status(200).json("The concert has been removed");
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

