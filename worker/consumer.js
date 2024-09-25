const AppError = require('../util/AppError');
const workerpool = require('workerpool');
const pool = workerpool.pool();

class Consumer {
    channel;
    constructor(channel){this.channel = channel};

    async convertVideo(queue,work){
        this.channel.consume(queue,async(msg)=>{
            let reply = {};
            try{
                //getting data
                const {content,replyQueue,correlationId} = this.deserializing(msg);
                const { resolution,id,path,name } = content;
                //sending success reply
                const data = {resolution,id,path,name}
                reply = await pool.exec(work,[data]);
                await this.messageToReplyQueue(replyQueue,reply,correlationId);
            }
            catch(err){
                reply.success = false;
                if(!err.statusCode){
                    reply.error = new AppError('Worker server failed the request',500);
                }else { reply.error = err;};
                //sending error
                await this.messageToReplyQueue(replyQueue,reply,correlationId);
            } finally {
                this.channel.ack(msg);
            }
        });
    };

    async messageToReplyQueue(replyQueue,reply,correlationId){
        this.channel.sendToQueue(replyQueue,Buffer.from(JSON.stringify(reply)),{
            contentType: 'application/json',
            correlationId: correlationId
        });
    }

    deserializing(msg){
    try {
        const content = JSON.parse(msg.content.toString());
        const replyQueue = msg.properties.replyTo;
        const correlationId = msg.properties.correlationId;
        return { content, replyQueue, correlationId };
    } catch (error) {
        throw new AppError('deserializing failed.',500);
    }
    }
}

module.exports = Consumer;