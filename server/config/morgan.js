const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(
    path.join(__dirname,'..','logs/http.log')
);

module.exports = morgan('combined',{
    stream:logStream
})