const express = require('express');
const router = express.Router();

// 引入配置文件
const multer = require('../../config/upload');

// 多文件上传 使用 multer.array('file',2)
router.post('/', multer.single('file'), function(req, res, next) {
    if (req.file) {
        let resJson = {
            code : 200,
            message: "文件上传成功",
            path: req.file.path
        };
        res.send(resJson);
    }
});
module.exports = router;