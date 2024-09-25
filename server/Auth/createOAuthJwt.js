const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const isEmailExist = require('./isEmail');
const AppError = require('../../util/AppError');
const redis = require('../Redis/redis');

exports.createOAuthJWT = async (userInfo)=>{
try{
    const email = userInfo.email;
    let user;
    if(await isEmailExist(email)){
        user = await User.findOne({email:email});
    } else {
        await redis.checkUserName(userInfo.name);
        user = await User.create({
            email:email,
            name:userInfo.name,
            role:userInfo.role,
            refreshToken:userInfo.refreshToken
        });
    }
    const payload = {
        id:user._id,
        role:user.role
    }
    const token = jwt.sign(payload,process.env.JWTSECRET,{expiresIn:'0.5h'});
    return token;
}
catch(err){
    if(!err.statusCode){
        throw new AppError('Signing JWT failed.',500,{token:false});
    }else{
        throw err;
    }
}
}