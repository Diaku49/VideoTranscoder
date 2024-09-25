const path = require('path');

function generateOutputPath(inputPath,width,height) {
    const extension = path.extname(inputPath);
    const baseName = path.basename(inputPath,extension);
    return `${baseName}_${width}x${height}${extension}`;
};

module.exports = generateOutputPath;