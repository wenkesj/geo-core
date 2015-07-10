var geo = require('../geolocation');

var myLocation = {
    lat: '35.73265',
    lon: '-78.85029'
};

console.time("findNearbyLocations");
geo.findNearbyLocations( myLocation, function(nearby) {
	console.timeEnd("findNearbyLocations");
	console.log(nearby);
});
