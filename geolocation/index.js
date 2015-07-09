var fs = require('fs');

var locationData = fs.readFileSync('./geolocation/cities5000.txt', 'utf8');
var locations = locationData.split("\n").map(function(locationInfo) {
    if (!locationInfo) return;
    var locationCols = locationInfo.split("\t");
    return {
        name: locationCols[1],
        latitude: locationCols[4],
        longitude: locationCols[5]
    };
});

var Geolocation = {
    locations : locations,

    // Calculate the distance between 2 targets.
    distanceBetween : function(lat1, lon1, lat2, lon2, radius){
        // Convert deltas to radians.
        var radCon = Math.PI/180;
        var p1 = lat1 * radCon;
        var p2 = lat2 * radCon;
        var dp = (lat2-lat1) * radCon;
        var dg = (lon2-lon1) * radCon;
        // Convert to spherical cordinates.
        // @eq -> sin(d/2) + sin(y)^2*cos(x)^2
        var alpha = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dg/2) * Math.sin(dg/2);
        // Convert to spherical distance.
        var conversion = 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1-alpha));
        // Calculate total distance.
        var distance = radius * conversion;
        return distance;
    },
    

    findNearbyLocations : function(options, position, callback) {
        console.info("Finding nearest locations around you ... √");
        var radius = 3959; // Miles
        if (options === {} || options === null) {
            radius = 3959;
        } else if (options.units === 'miles' ) {
            radius = 3959;
        } else if (options.units === 'kilometers') {
            radius = 6371.38;
        } else if (options.units === 'meters') {
            radius = 63713.8;
        }
        var GOLD = options.conversionToMiles,
            MAXR = options.maxRadius,
            latitude = position.lat,
            longitude = position.lon,
            nearby = [],
    		_this = this;
        this.locations.forEach( function(obj) {
            if (!obj) return;
            var dx = Math.abs(obj.longitude-longitude)*GOLD, // Convert difference of longitude to ratio.
                dy = Math.abs(obj.latitude-latitude)*GOLD, // Convert difference of longitude to ratio.
                d = _this.distanceBetween(latitude, longitude, obj.latitude, obj.longitude, radius); // Calculate the distance away.

            // If the location is less than or equal to the max distance and the calculated distance is less than or equal to the max distance...
            if (dx <= MAXR && dy <= MAXR && d <= MAXR) {
                obj.distance = d;
                obj.units = options.units;
                nearby.push(obj);
            }
        });
        console.log("Found all locations within "+MAXR+" "+options.units+" from you ... √");
        callback(nearby);
    }
};

module.exports = Geolocation;
