// getConcerts, getOneConcertById, createConcert, deleteConcert
const ApiError = require('../error/ApiError');
const Concert = require('../schemas/concertSchema');

const getConcerts = async(req, res) =>{
    try{
        let concerts = [];
        let { type, dateTime, venue, page, limit} = req.query;
        limit = limit || 5;
        const offset = (page-1)*limit;
        let count;
        if (!type && !dateTime && !venue){
            concerts = await Concert.find().skip(offset).limit(limit);
            count = await Concert.find().count();
        } else {
            const query = {};
            if (type) query.type = type;
            if (dateTime) query.dateTime = { $gte: new Date(dateTime)};
            if (venue) query.venue = venue;
            concerts = await Concert.find(query).skip(offset).limit(limit);
            count = await Concert.find(query).count();
        }
        return res.status(200).json({concerts, count});
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
        const { name, description, type, price, venue, dateTime } = req.body;
        const {mimetype, buffer} = req.file;
        const concert = await Concert.create({ name, description, type, image: {mimetype, buffer}, price, venue, dateTime });
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

