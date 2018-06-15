const express = require('express');
const router = express.Router();

// 引入配置文件
const multer = require('../../config/multer');

router.post('/', multer.single('file'), function(req, res, next) {
    res.send(req.file);
});

module.exports = router;