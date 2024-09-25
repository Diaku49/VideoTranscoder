const jwt = require('jsonwebtoken');
const AppError = require('../../../util/AppError');


exports.simpleAuth = async (req,res,next)=>{
try{
    const authHeader = req.get('Authorization');
    if(!authHeader && !authHeader.startsWith('Bearer ')){
        throw new AppError('Auth header not provided.',403);
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    if(!decodedToken){
        throw AppError('Invalid token.',401,{token:false});
    }
    req.userId = decodedToken.id;
    req.role = decodedToken.role;
    next();
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Server Error.',500));
    }else{
        next(err);
    }
}
};