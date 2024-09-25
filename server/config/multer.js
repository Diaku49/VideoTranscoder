const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination:'../../uploads',
    filename:function (req,file,cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

function checkFileType(file, cb) {
  // Allowed file extensions
    const filetypes = /mp4|mov|avi|mkv/;

    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Videos Only!');
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 400000000 }, // Limit file size to 400MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;