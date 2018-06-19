const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: '192.168.10.74:9200',
    log: 'info'
});
module.exports = client;