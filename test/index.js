var geo = require('../geolocation');

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
var myLocation = {
    lat: '35.873638799999995',
    lon: '-78.84235389999999'
};

console.time("apex");
geo.findNearbyLocations( apex, function(nearby) {
	console.timeEnd("apex");
	console.log(nearby);
});

console.time("durham");
geo.findNearbyLocations( durham, function(nearby) {
	console.timeEnd("durham");
	console.log(nearby);
});

console.time("pacificOcean");
geo.findNearbyLocations( pacificOcean, function(nearby) {
	console.timeEnd("pacificOcean");
	console.log(nearby);
});

console.time("myLocation");
geo.findNearbyLocations( myLocation, function(nearby) {
	console.timeEnd("myLocation");
	console.log(nearby);
});
