const express = require('express');
const {body} = require('express-validator');
const { simpleAuth } = require('../Auth/Middleware/isSimpleAuth');
const streamController = require('../controllers/stream');


const Router = express.Router();


Router.post('/video/:videoId',simpleAuth,streamController.streamVideo);

module.exports = Router;