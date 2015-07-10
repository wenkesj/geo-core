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
        var offset = 0.01;
        this.performGeoSearch(5,offset,latitude,longitude);
        console.log("Found all locations close to you ... √");
        callback(this.nearbyLocations);
        this.nearbyLocations = [];
    },
    performGeoSearch : function(m,offset,latitude,longitude) {
        var lats = [], lons = [];
        for (var g = -m; g < m + 1; g++) {
            lats.push((parseFloat(latitude)+parseFloat(g*offset)).toFixed(2));
            lons.push((parseFloat(longitude)+parseFloat(g*offset)).toFixed(2));
        }
        for (var i = 0; i < 2*m+1; i++) {
            var key1 = lats[i];
            var key2 = lons[i];
            for (var j = 0; j < 2*m+1; j++) {
                var key = lats[i]+','+lons[j];
                var locations = this.locations[key];
                if (!locations) continue;
                for (var k = 0; k < locations.length; k++) {
                    var location = locations[k];
                    this.performCalculation(location, latitude, longitude);
                }
            }
        }
        if (!this.nearbyLocations[2]) {
            if (m > 16) return this.nearbyLocations.push({name: "Error",type:"No locations found, "+m*m+" attempts."});
            return this.performGeoSearch(2*m,offset,latitude,longitude);
        }
    },
    performCalculation : function(location,latitude,longitude) {
        if (this.nearbyLocations[0]) {
            var id = this.nearbyLocations.indexOf(location);
            if (id > -1) return this.nearbyLocations.splice(id,1);
        }
        var d = this.distanceBetween(latitude, longitude, location.latitude, location.longitude); // Calculate the distance away.
        location.distance = d;
        location.units = 'miles';
        this.nearbyLocations.push(location);
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
