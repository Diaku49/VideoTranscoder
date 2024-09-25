const {google} = require('googleapis');
const AppError = require('../../util/AppError');

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);

exports.validRefreshToken = async(refreshToken)=>{
    oauth2Client.setCredentials({
        refresh_token:refreshToken
    });
    const isValid = await oauth2Client.getAccessToken();
    if(isValid) return new AppError('refreshToken got expired',401,{token:false});
}