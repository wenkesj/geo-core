var geo = require('../geolocation');

var location_1 = {
    lat: '35.73265',
    lon: '-78.85029'
};

var location_2 = {
    lat: '35.73265',
    lon: '-50.85029'
};

console.time("location_1");
geo.findNearbyLocations( location_1, function(nearby) {
	console.timeEnd("location_1");
	console.log(nearby);
});

// console.time("location_1");
// geo.findNearbyLocations( location_1, function(nearby) {
// 	console.timeEnd("location_1");
// 	console.log(nearby);
// });
