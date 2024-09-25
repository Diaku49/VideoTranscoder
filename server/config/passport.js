const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const createOAuthJWT = require('../Auth/createOAuthJwt');
const redis = require('../Redis/redis');
const AppError = require('../../util/AppError');

passport.use(new GoogleStrategy({
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SERCRET,
    callbackURL:process.env.CALLBACKURL
},
async function(accessToken,refreshToken,profile,email,cb){
    try{
        const email = profile.emails[0];
        const name = profile.name;
        //Checking userName
        await redis.checkUserName(name);
        //Preparing data
        const userInfo = {
            email:email,
            name:name,
            role:'Normal',
            refreshToken:refreshToken
        };
        const token = await createOAuthJWT(userInfo)
        return cb(null,{token})
    }
    catch(err){
        if(!err.statusCode){
            throw new AppError('Signup failed.',500,{token:false});
        } else{
            throw err;
        }
    }
})
)


module.exports = passport;