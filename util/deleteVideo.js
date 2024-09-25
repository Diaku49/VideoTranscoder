const fs = require('fs').promises;

async function deleteVideo(path){
    await fs.unlink(path);
};

module.exports = deleteVideo;