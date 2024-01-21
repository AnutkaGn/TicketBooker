// signUpUser, logInUser, addToBasketOrBookedArray, deleteFromBasket
const User = require('../schemas/userSchema');


const signUpUser = async(req, res) =>{
    try{
        const {login, password, email} = req.body;

        //await User.findOne({where: {email}});
        const newUser = await User.create({login, password, email});
        res.json({newUser});
    }
    catch (error){
        console.log(error);
    }
};

const logInUser = async(req, res) =>{
    

};

const addToBasketOrBookedArray = async(req, res) =>{

};

const deleteFromBasket = async(req, res) =>{

};
 
module.exports={
    signUpUser, 
    logInUser, 
    addToBasketOrBookedArray, 
    deleteFromBasket
}

