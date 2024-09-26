const {createClient} = require('redis');
const AppError = require('../../util/AppError');
const appConfig = require('../config/app.config');

class RedisClient {
    client
    userSet
    constructor() {
        this.client = this._initializeClient();
        this.userSet = 'username';
    }

    _initializeClient() {
        const client = createClient({
            password: appConfig.redis.password,
            socket: {
                host: appConfig.redis.host,
                port: appConfig.redis.port
            }
        });
        // Handling error
        client.on('error', (err) => {
            console.error('Couldn’t connect to Redis server:', err);
        });
        // Connect to Redis
        client.connect().catch((err) => {
            throw new AppError('Failed to connect to Redis', 500, err);
        });
        // Logging
        client.on('connect',()=>{
            console.log('Successfully connected to Redis!')
        })
        return client;
    }

    async checkUserName(name) {
        try {
            const isExist = await this.client.sAdd(this.userSet,name);
            if (isExist === 0) {
                throw new AppError('Username already taken.', 422);
            }
            return true;
        } catch (err) {
            if(!err.statusCode){
                throw new AppError('Couldn’t check username', 500, err);
            }
            throw err;
        }
    }
}


module.exports = new RedisClient();