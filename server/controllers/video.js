const {isValid} = require('../../util/isValid');
const producer = require('../RabbitMQ/Producer')
const Video = require('../../models/Video');
const AppError = require("../../util/AppError");
const deleteVideo = require('../../util/deleteVideo');

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

const workerpool = require('workerpool');
const pool = workerpool.pool();



exports.uploadVideo = async (req,res,next)=>{
try{
    isValid(req);
    const name = req.body.name;
    const path = req.file.path;
    const resolution = await pool.exec(getResolution,[path]);
    const newVideo = await Video.create({
        name:name,
        path:path,
        resolution:resolution
    });
    res.status(201).json({
        message:'upload complete.',
        newVideo:newVideo
    });
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Couldnt upload video.',500));
    }else{
        next(err);
    }
}
}



exports.updateVideo = async (req,res,next)=>{
try{
    isValid(req);
    const videoId = req.params.videoId;
    //checking ownership
    await videoOwner(videoId,req.userId);
    //updating
    const name = req.body.name;
    const updatedVideo = await Video.findByIdAndUpdate(videoId,{name:name},{new:true});

    res.status(200).json({
        message:'Video update complete.',
        updatedVideo:updatedVideo
    });
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Couldnt update video.',500));
    }else{
        next(err);
    }
}
}



exports.convertVideo = async (req,res,next)=>{
try{
    //validating the request
    isValid(req);
    // Check ownership
    const videoId = req.params.videoId;
    const isOwns = await Video.findOne({
        _id:videoId,
        'user.id':req.userId
    });
    if(!isOwns){
        throw new AppError('Not the owner.',403);
    }
    const resolution = req.body.resolution;
    const routingKey = process.env.CROUTING_KEY;
    //checking the resolution conflict
    if(isOwns.resolution === resolution ){
        throw new AppError('Video already has the wanted resolution');
    }
    //prepare message and send
    const msg = {
        resolution:resolution,
        id:videoId,
        path:isOwns.path
    }
    await producer.publishMessage(routingKey,msg,req.userId);
    //consuming the reply message
    const reply = await producer.consumeReply(req.userId);
    if(reply.success){
        const newVideo = await Video.create(reply.videoData);
        res.status(201).json({
            message:'Converted successfully.',
            newVideo:newVideo
        });
    } else {throw reply.error};
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Couldnt convert video.',500));
    }else{
        next(err);
    }
}
};


exports.deleteVideo = async (req,res,next)=>{
try{
    const videoId = req.params.videoId;
    await videoOwner(videoId,req.userId);
    const path = await Video.findByIdAndDelete(videoId);
    await deleteVideo(path);
    res.status(200).json({
        message:'Video deleted successfully.'
    })
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Couldnt upload video.',500));
    }else{
        next(err);
    }
}
}


function getResolution(path){
    return new Promise((resolve,reject)=>{
        ffmpeg.ffprobe(path,(err,metadata)=>{
            if(err){
                return reject(new AppError('Error retrieving video metadata',422))
            }
            // Extract width and height from the metadata
            const videoStream = metadata.streams.find(stream => stream.width && stream.height);
            if (videoStream) {
                const resolution = `${videoStream.width}x${videoStream.height}`;
                resolve(resolution);
            } else{
                reject(new AppError('Could not find video resolution in metadata.',422))
            }
        });
    });
}

async function videoOwner(videoId,userId){
    const video = await Video.exists({
        _id: videoId,
        'user.id': userId
    });
    if (!video) {
        throw new AppError('No video found or not owned by user.', 404);
    };
}