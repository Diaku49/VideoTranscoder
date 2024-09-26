require('dotenv').config();

module.exports = {
    port:parseInt(process.env.PORT),
    jwtSecret:process.env.JWT_SECRET,
    jwtRefreshSecret:process.env.JWT_RSECRET,
    database:{
        url:process.env.MONGODB_URL
    },
    redis:{
        host:process.env.REDIS_HOST,
        port:parseInt(process.env.REDIS_PORT),
        password:process.env.REDIS_PASS
    },
    googleOAuth:{
        clientId:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        callbackUrl:process.env.CALLBACKURL
    }
}