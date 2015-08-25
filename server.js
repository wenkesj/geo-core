var config = require('./config.json');
var express = require('express');
var app = express();
var fs = require('fs');
var server = require('http').createServer(app);
var geocore = require('./geo-core');

server.listen(config.port, function () {
    console.log('Server listening at port: ', config.port);
});

/**
 * Allow CO
 */
app.all('/geo-core', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get('/geo-core', function (req, res) {
    geocore.findNearbyLocations(req.query, function(nearby) {
        res.send(nearby);
    });
});
