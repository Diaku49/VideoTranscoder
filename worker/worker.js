const initialize = require('./config');
const Consumer = require('./consumer');
const channel = await initialize();
const consumer =  new Consumer(channel);

//QUEUES
const queueConvert = process.env.QUEUE_NAME;
//WORKS
const convertVideo = require('./scripts/convertVideo');

//Consume
consumer.convertVideo(queueConvert,convertVideo);