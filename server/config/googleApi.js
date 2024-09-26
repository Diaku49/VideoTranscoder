const {google} = require('googleapis');
const AppError = require('../../util/AppError');
const appConfig = require('./app.config');

const oauth2Client = new google.auth.OAuth2(
    appConfig.googleOAuth.clientId,
    appConfig.googleOAuth.clientSecret
);

exports.validRefreshToken = async(refreshToken)=>{
    oauth2Client.setCredentials({
        refresh_token:refreshToken
    });
    const isValid = await oauth2Client.getAccessToken();
    if(isValid) return new AppError('refreshToken got expired',401,{token:false});
}