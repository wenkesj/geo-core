var fs = require('fs');
var locationData = fs.readFileSync('./geolocation/cities5000.txt', 'utf8');
var locations = locationData.split("\n").map(function(locationInfo) {
    if (!locationInfo) return;
    var locationCols = locationInfo.split("\t");
    return {
        name: locationCols[1],
        latitude: parseFloat(locationCols[4]).toFixed(5),
        longitude: parseFloat(locationCols[5]).toFixed(5)
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
    latKey = parseFloat(latKey).toFixed(2);
    lonKey = parseFloat(lonKey).toFixed(2);
    var key = latKey+","+lonKey;
    if (locationMap[key]) {
        locationMap[key].push(locations[i]);
        continue;
    }
    locationMap[key] = [locations[i]];
}
var Geolocation = {
    locations : locationMap,
    nearbyLocations : [],
    radiansConversion : Math.PI/180,
    findNearbyLocations : function(position, callback) {
        console.info("Finding nearest locations around you ... √");
        var latitude = position.lat;
        var longitude = position.lon;
        var p = -4, q = 5;
        var r = null, s = null;
        this.performGeoSearch(p,q,r,s,latitude,longitude);
        console.log("Found all locations close to you ... √");
        callback(this.nearbyLocations);
        this.nearbyLocations = [];
    },
    performGeoSearch : function(p,q,r,s,latitude,longitude) {
        var max = Math.abs(p)+q;
        var h = 0;
        var key, latKey, lonKey;
        var latChop = parseFloat(latitude);
        var lonChop = parseFloat(longitude);
        console.log("Checking for locations near you ... √");
        for (var i = p; i < q; i++, h++) {
            // Check if the iterations have already been through.
            offset = parseFloat(i / 100);
            if (offset >= 1 || offset <= -1) {
                return this.nearbyLocations.push({
                    name: "Error",
                    type: "The closest city with > 5000 population is further than ~138 miles"
                });
            }
            latKey = parseFloat(latChop + offset).toFixed(2);
            lonKey = parseFloat(lonChop + offset).toFixed(2);
            key = latKey+","+lonKey;
            if (!this.locations[key]) {
                if (!this.nearbyLocations[0] && h === max-1) {
                    r = p-4;
                    s = q+4;
                    return this.performGeoSearch(r,s,p,q,latitude,longitude);
                }
                continue;
            }
            this.performCalculation(key, latitude, longitude);
        }
    },
    performCalculation : function(key,latitude,longitude) {
        var location, dx, dxf, dy, d;
        for (var j = 0; j < this.locations[key].length; j++) {
            location = this.locations[key][j];
            d = this.distanceBetween(latitude, longitude, location.latitude, location.longitude); // Calculate the distance away.
            location.distance = d;
            location.units = 'miles';
            this.nearbyLocations.push(location);
        }
    },
    distanceBetween : function(lat1, lon1, lat2, lon2){
        var radius = 3959;
        var p1 = this.radiansConversion*lat1;
        var p2 = this.radiansConversion*lat2;
        var dp = this.radiansConversion*(lat2-lat1);
        var dg = this.radiansConversion*(lon2-lon1);
        var alpha = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dg/2) * Math.sin(dg/2);
        var conversion = 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1-alpha));
        var distance = radius * conversion;
        return distance;
    }
};

module.exports = Geolocation;
