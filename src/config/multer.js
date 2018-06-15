const mu  = require('multer');

const storage = mu.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+file.originalname)
    }
});

const multer = mu({ storage: storage });

module.exports = multer;