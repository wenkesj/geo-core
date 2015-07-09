var geo = require('../geolocation');

var myLocation = {
    lat: '35.73265',
    lon: '-78.85029'
};
var options = {
	units: 'miles',
	conversionToMiles: 69,
	maxRadius: 10
};

console.time("findNearbyLocations");
geo.findNearbyLocations(options, myLocation, function(nearby) {
	console.timeEnd("findNearbyLocations");
});
