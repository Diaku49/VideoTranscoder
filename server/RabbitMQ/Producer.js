const amqp = require('amqplib');
const AppError = require('../../util/AppError');
const exchangeName = process.env.EXCHANGE;

class Producer {
    channel;

    async initialize(){
        const rabbit = await amqp.connect(process.env.RABBITURL);
        this.channel = await rabbit.createChannel();
        //setting up Exchange
        await this.channel.assertExchange(exchangeName,'direct',{
            durable:true
        });
        //Asserting Queue's
        await this.channel.assertQueue(process.env.CONVERT_QUEUE);
    }

    async publishMessage(routingKey,message,correlationId) {
        if(!this.channel){
            await this.initialize();
        };
        //setting up Reply Queue
        const {queue} = await this.channel.assertQueue('',{
            exclusive:true,
            messageTtl:30000
        });
        //binding
        await this.channel.bindQueue(process.env.CONVERT_QUEUE,exchangeName,routingKey);
        // publishing message
        await this.channel.publish(exchangeName,routingKey,Buffer.from(JSON.stringify(message)),{
            replyto:queue,
            correlationId:correlationId,
            contentType: 'application/json'
        });
        console.log(`this message is sent to ${routingKey} queue.`);
    }

    async consumeReply(correlationId) {
        return new Promise((resolve, reject) => {
        this.channel.consume(this.replyQueue, (msg) => {
            try {
                // Parse message content
                const reply = JSON.parse(msg.content.toString());
                const RcorrelationId = msg.properties.correlationId;
                const type = msg.properties.contentType;

                // Check correlationId and contentType
                if (RcorrelationId === correlationId && type === 'application/json') {
                    this.channel.ack(msg);
                    resolve(reply);
                } else {
                    this.channel.nack(msg);
                }
            } catch (err) {
                this.channel.nack(msg);
                reject(new AppError('Failed to process reply message',500));
            }
        });
    });
};
}

module.exports = new Producer();