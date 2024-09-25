const amqp = require('amqplib');
const os = require('os');

export default async  function initialized(){
    try{
        process.env.UV_THREADPOOL = os.cpus().length - 1;

        const rabbitmq = await amqp.connect(process.env.RABBITURL);
        const channel = await rabbitmq.createChannel();
        return channel;
    }
    catch(err){
        throw new Error('Initializing Failed.');
    }
}
