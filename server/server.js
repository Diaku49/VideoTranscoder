const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('./config/morgan');
const path = require('path');
const appConfig = require('./config/app.config');



const app = express();
const AppError = require('../util/AppError');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan);    //search for it
app.use(cors());

app.use('/video',express.static(path.join(__dirname,'..','/s')));


//main routers
const authRoute = require('./routes/auth');
const videoRoute = require('./routes/video');
const streamRoute = require('./routes/stream');


app.use('auth',authRoute);
app.use('video',videoRoute);
app.use('stream',streamRoute);


app.use((error,req,res,next)=>{
    if(error instanceof AppError){
        const errorObject = {
            message:error.message,
        }
        if(error.data) errorObject.data = error.data

        res.status(error.statusCode).json(errorObject);
    } else{
        console.error('Unhandled error',error);
        res.status(500).json({
            message:'Server error'
        })
    }
})


async function initialize(){
    try{
        await mongoose.connect(appConfig.database.url);
        console.log('Connected to Database.')
        app.listen(appConfig.port,()=>{
            console.log('Server is running.')
        })
    }
    catch(error){
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
}


module.exports = initialize;