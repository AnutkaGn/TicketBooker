// signUpUser, logInUser, addToTickets, deleteFromTickets
const ApiError = require('../error/ApiError');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 

const generateToken = ({login, email, role, tickets}) =>{
    return jwt.sign(
        {login, email, role, tickets},
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    );
};

const signUpUser = async(req, res, next) => {
    try {
        const { login, password, email, role } = req.body;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[_!\-@#\$%\^&\*])(?=.{8,})/
        if(!password.match(passwordRegex)){
            return next(ApiError.badRequest("The password is invalid"));
        }
        const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/
        if(!email.match(emailRegex)){
            return next(ApiError.badRequest("The email is invalid"));
        }
        // Check if user already exists
        const userEmail = await User.findOne({ email });
        if (userEmail) return next(ApiError.badRequest("User with this email already exists"));
        const userLogin = await User.findOne({ login });
        if (userLogin) return next(ApiError.badRequest("User with this login already exists"));

        const hashedPassword = await bcrypt.hash(password, 5);
        const newUser = await User.create({ login, password: hashedPassword, email, role });
        const token = generateToken(newUser);
        return res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};





const logInUser = async(req, res, next) =>{
    try{
        const {login, password} = req.body;
        const user = await User.findOne({login});
        if (!user) return next(ApiError.badRequest("Incorrect login or password"));
        const comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) return next(ApiError.badRequest("Incorrect login or password"));
        const token = generateToken(user);
        return res.status(200).json({token});
    }
    catch (error){
        return res.status(500);
    }
};

const check = async(req, res) => {
    try {
        const token = generateToken(req.user);
        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500);
    }
}

const addToTickets = async(req, res) =>{
    try{
        const { id } = req.body;
        const user = req.user;
        const updatedUser = await User.findOneAndUpdate({login: user.login}, {$push: {tickets: id}}, {new: true});
        const token = generateToken(updatedUser);
        return res.status(200).json({ token });
    }
    catch (error){
        console.error(error);
        return res.status(500);
    }
};

// const deleteFromTickets = async(req, res) =>{
//     try{
//         const { id } = req.body;
//         const user = req.user;
//         const updatedUser = await User.findOneAndUpdate({login: user.login}, {$pull: {tickets: id}}, {new: true});
//         const token = generateToken(updatedUser);
//         console.log(updatedUser)
//         return res.status(200).json({ token,  updatedUser});
//     }
//     catch (error){
//         console.error(error);
//         return res.status(500);
//     }
// };
 
module.exports={
    signUpUser, 
    logInUser, 
    check,
    addToTickets
}

