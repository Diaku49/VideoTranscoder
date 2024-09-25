const express = require('express');
const videoController = require('../controllers/video');
const {body} = require('express-validator');
const {simpleAuth} = require('../Auth/Middleware/isSimpleAuth');
const upload = require('../config/multer');


const Router = express.Router();

Router.post('/',simpleAuth,upload.single('video'),
[
    body('name').trim()
    .isString().withMessage('Invalid name')
],videoController.uploadVideo);

Router.put('/:videoId',simpleAuth,[
    body('name').trim()
    .isString().withMessage('Invalid name')
],videoController.updateVideo);

Router.patch('/:videoId',simpleAuth,
[body('resolution').trim()
.isString().withMessage('Invalid resolution')
],
videoController.convertVideo);

Router.delete('/:videoId',simpleAuth,videoController.deleteVideo);

module.exports = Router;