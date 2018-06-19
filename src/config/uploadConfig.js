const multer  = require('multer');

const storage = multer.diskStorage({
    //Note:如果你传递的是一个函数，你负责创建文件夹，如果你传递的是一个字符串，multer会自动创建
    destination: process.cwd() + '/uploads',
    //文件重复会直接覆盖
    filename: function (req, file, cb) {
        let fileFormat = /*Date.now() + "_" + */file.originalname;
        cb(null, fileFormat)
    }
});

const uploadConfig = multer({
    storage: storage,
    limits:{
        //限制文件的大小为10M
        fileSize:1024*1024*10
    }
});

module.exports = uploadConfig;