const express = require('express');
const Router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/auth');
const {body} = require('express-validator');
const {simpleAuth} = require('../Auth/Middleware/isSimpleAuth');


Router.get('/auth/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

Router.get('/auth/google/callback',passport.authenticate('google',{session:false}),authController.googleCallback);

Router.post('/signup',[
    body('email')
    .trim().normalizeEmail()
    .isEmail().withMessage('invalid Email'),
    body('password')
    .trim().isString().withMessage('invalid pass input.')
    .isLength({min:8}),
    body('name')
    .trim().isString().withMessage('invalid pass input.'),
    body('phoneNumber')
    .optional()
    .isMobilePhone()
],authController.signUp);

Router.post('/login',[
    body('email')
    .trim().normalizeEmail()
    .isEmail().withMessage('invalid Email'),
    body('password')
    .trim().isString().withMessage('invalid pass input.')
    .isLength({min:8}),
],authController.logIn);

Router.patch('/token',authController.grantNewToken);

Router.delete('/logout',simpleAuth,authController.logOut);

module.exports = Router;