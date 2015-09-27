var config = require('./config.json');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var geolocation = require('./geolocation');

server.listen(config.port, function () {
    console.log('Server listening at port: ', config.port);
});

app.all('/geo-core', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	next();
});

app.get('/geo-core', function (req, res) {
	geolocation.findNearbyLocations(req.query).then(function(nearby) {
        res.send(nearby);
    });
});
