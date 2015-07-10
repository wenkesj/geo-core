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
locations.sort(function(location1, location2) {
    return parseFloat(location1.latitude) - parseFloat(location2.latitude);
});
var locationMap = {};
for (var i = 0; i < locations.length; i++) {
    if (!locations[i]) continue;
    var latKey = locations[i].latitude;
    var lonKey = locations[i].longitude;
    var fixed = Math.pow(10, 2);
    latKey = Math.floor(latKey * fixed) / fixed;
    lonKey = Math.floor(lonKey * fixed) / fixed;
    var key = latKey+","+lonKey;
    if (locationMap[key]) {
        locationMap[key].push(locations[i]);
        continue;
    }
    locationMap[key] = [locations[i]];
}
var Geolocation = {
    locations : locationMap,
    radiansConversion : Math.PI/180,
    distanceBetween : function(lat1, lon1, lat2, lon2, radius){
        var p1 = this.radiansConversion*lat1;
        var p2 = this.radiansConversion*lat2;
        var dp = this.radiansConversion*(lat2-lat1);
        var dg = this.radiansConversion*(lon2-lon1);
        var alpha = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dg/2) * Math.sin(dg/2);
        var conversion = 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1-alpha));
        var distance = radius * conversion;
        return distance;
    },
    findNearbyLocations : function(position, callback) {
        console.info("Finding nearest locations around you ... √");
        var radius = 3959;
        var latitude = position.lat;
        var longitude = position.lon;
        var fixed = Math.pow(10, 2);
        var key, latKey, lonKey;
        var nearbyLocations = [], location;
        var dx, dxf, dy, d;
        var _this = this;
        for (var i = -4; i < 5; i++) {
            offset = i / fixed;
            latKey = Math.round(((Math.floor(latitude * fixed) / fixed) + offset)*fixed)/fixed;
            lonKey = Math.round(((Math.floor(longitude * fixed) / fixed) + offset)*fixed)/fixed;
            key = latKey+","+lonKey;
            if (!this.locations[key]) {
                continue;
            }
            for (var j = 0; j < this.locations[key].length; j++) {
                location = this.locations[key][j];
                d = _this.distanceBetween(latitude, longitude, location.latitude, location.longitude, radius); // Calculate the distance away.
                location.distance = d;
                location.units = 'miles';
                nearbyLocations.push(location);
            }
        }
        console.log("Found all locations close to you ... √");
        callback(nearbyLocations);
    }
};

module.exports = Geolocation;
