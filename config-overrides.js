const express = require('express');
const app = express();

app.use("/upload",require("./src/components/apis/upload"));


module.exports = function override(config, env) {
    // do stuff with the webpack config...
    // config =
    return config;
};