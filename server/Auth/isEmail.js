const User = require('../../models/User');
const AppError = require('../../util/AppError');
exports.isEmailExist = async (email)=>{
try{
    const isEmail = await User.exists({email:email});
    if(isEmail){
        return true
    } else{
        return false
    }
}
catch(err){
    if(!err.statusCode){
        throw new AppError('Checking email failed.',500,{token:false});
    }else{
        throw err;
    }
}
};