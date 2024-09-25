const Video = require('../../models/Video');
const AppError = require('../../util/AppError');
const path = require('path');
const fs = require('fs')

exports.streamVideo = async (req,res,next)=>{
try{
    const videoId = req.params.videoId;
    const isExistVideo = await Video.findById(videoId);
    if(!isExistVideo){
        throw new AppError('Video doesnt exist.',404);
    }
    const videoPath = isExistVideo.path;
    const fileSize = fs.statSync(videoPath).size;
    const range = req.header.range;
    //Checking range header
    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4', // Adjust for your video type
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4', // Adjust for your video type
        };

        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    };
    res.status(201).json({
        message:'upload complete.',
        newVideo:newVideo
    });
}
catch(err){
    if(!err.statusCode){
        next(new AppError('Couldnt stream the video.',500));
    }else{
        next(err);
    }
}
}