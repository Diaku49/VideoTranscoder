const {validationResult} = require('express-validator');
const AppError = require('./AppError');

exports.isValid = (req)=>{
    const err = validationResult(req);
    if(!err.isEmpty()){
        const data = err.array();
        const error = new AppError('Validation failed.',422,data);
        throw error;
    }
}