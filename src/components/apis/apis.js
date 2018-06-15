const express = require('express');
const http = require('http');
const app = express();



app.use("/upload",require("./upload"));

module.exports = app;