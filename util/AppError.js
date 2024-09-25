class AppError extends Error{
    constructor(message,statusCode,data){
        super(message)
        this.statusCode = statusCode;
        this.isOperational = true;
        if(data){
            this.data = data
        }
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;