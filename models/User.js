const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:false
    },
    phoneNumber:{
        type:Number,
        required:false
    },
    role:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String,
        required:false
    },
    video:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video',
        required:false
    }]
});
const User = mongoose.model('User',UserSchema);


module.exports = User;