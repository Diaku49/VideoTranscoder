const AppError = require('../../util/AppError');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const generateOutputPath = require('../../util/generatePath');

ffmpeg.setFfmpegPath(ffmpegPath);

async function convertVideo(data){
try{
    const [width, height] = (data.resolution).split('x');
    const outputPath = generateOutputPath(
        data.path,
        width,
        height
    );
    // Start converting
    return new Promise((resolve,reject) => {
        ffmpeg(data.path)
        .outputOption([`-vf scale=${width}:${height}`])
        .on('end',async ()=>{
            const videoData = {
                name:data.name,
                path:outputPath,
                resolution:`${width}x${height}`
            };
            resolve({success:true,videoData:videoData});
        })
        .on('error', (err) => {
            reject(new AppError('Converting failed at ffmpeg', 422));
        })
        .save(outputPath);
    });
}
catch(err){
    throw new AppError('Converting work failed.',500);
}
}

module.exports = convertVideo;