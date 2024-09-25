const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoSchema = new Schema({
    path:{
        type:String,
        required:true
    },
    resolution:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    }
});

const Video = mongoose.model('Video',VideoSchema);

module.exports = Video;