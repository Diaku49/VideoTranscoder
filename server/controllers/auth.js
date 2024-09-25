const User = require("../../models/User");
const { isEmailExist } = require("../Auth/isEmail");
const { userData, validRefreshToken } = require("../config/googleApi");
const AppError = require("../../util/AppError");
const { isValid } = require("../../util/isValid");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redis = require('../Redis/redis');


exports.googleCallback = (req,res,next)=>{
try{
    const token = req.user.token;
    res.status(200).json({
        token:token,
        message:'User SignedUp.'
    })
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Signup failed.',500,{token:false}));
    }else{
        next(err);
    }
}
}

exports.signUp = async (req,res,next)=>{
try{
    isValid(req);
    const {email,name,password,phoneNumber} = req.body;
    //checking email
    if(isEmailExist(email)){
        const error = new AppError('This email already exist.',409);
        throw error;
    }
    //Checking username
    await redis.checkUserName(name);
    //Preparing data
    const newPassword = bcrypt.hash(password,12);
    const userInfo = {
        email:email,
        name:name,
        password:newPassword,
        role:'Normal'
    }
    if(phoneNumber){
        userInfo.phoneNumber = phoneNumber;
    }
    const user = new User(userInfo);
    const newUser = await user.save();
    res.status(201).json({
        user:newUser,
        message:'User SignedUp.'
    })
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Signup failed.',500));
    }else{
        next(err);
    }
}
}

exports.logIn = async (req,res,next)=>{
try{
    isValid(req);
    const {email,password} = req.body;
    const user = await User.findOne({email:email});
    if(!user){
        throw new AppError('Email doesnt exist.',404)
    };
    const isPassValid = bcrypt.compare(password,user.password);
    if(!isPassValid){
        throw new AppError('Wrong password.',422)
    };
    const token = jwt.sign({
        id:user._id,
        role:user.role
    },process.env.JWT_SECRET,{expiresIn:'0.5h'});
    res.status(201).json({
        token:token,
        message:'Logged in successfully.'
    })
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Logged In failed.',500));
    }else{
        next(err);
    }
}
}

exports.grantNewToken = async(req,res,next)=>{
try{
    const userId = req.body.id;
    const user = await User.findById(userId).select('refreshToken email role');
    if(!user){
        throw new AppError('Couldnt find user',409)
    };
    if(!user.refreshToken){
        throw new AppError('No refreshToken available',409)
    };
    validRefreshToken(user.refreshToken);

    const token = jwt.sign({
        id:userId,
        role:user.role
    },process.env.JWT_SECRET,{expiresIn:'0.5h'});

    res.status(201).json({
        token:token,
        message:'Issued new token.'
    });
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Token failed.',500));
    }else{
        next(err);
    }
}
}

exports.logOut = async (req,res,next)=>{
try{
    const userId = req.user.id;
    await User.updateOne({_id:userId},{$set:{refreshToken:null}});
    res.status(200).json({
        message:'Logged out successfully.'
    });
}
catch(err){
    next(new AppError('Logging out failed.',500));
}
}