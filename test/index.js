var geo = require('../geo-core');

var apex = {
    lat: '35.73265',
    lon: '-78.85029'
};
var durham = {
    lat: '36.0012103',
    lon: '-78.8824805'
};
var pacificOcean = {
    lat: '-13.7036473',
    lon: '-148.9712961'
};

console.time('apex');
geo.findNearbyLocations(apex).then(function(nearby) {
	console.timeEnd('apex');
	console.log(nearby);
});

console.time('durham');
geo.findNearbyLocations(durham).then(function(nearby) {
	console.timeEnd('durham');
	console.log(nearby);
});

console.time('pacificOcean');
geo.findNearbyLocations(pacificOcean).then(function(nearby) {
	console.timeEnd('pacificOcean');
	console.log(nearby);
});
