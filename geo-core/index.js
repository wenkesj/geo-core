var fs = require('fs');
var path = require('path');
var citiesFilePath = path.normalize(path.join(__dirname, 'cities5000.txt'));
/**
    Geolocation parses a .txt file into a JSON object sorted
    by latidude value numerically and with (latitude,longitude)
    fixed decimal indexing. The locations are stored in an
    array.
 *
 *  @const radius is the radius of the earth in @const units.
 *  @const radiansConversion converts degrees to radians.
 *  @const offset is the latidude and longitude offset for lookup
 *  @const permutations are the number of initial iterations about
    the center point.
 *
 */
var radius = 3959, radiansConversion = Math.PI/180, offset = 0.01, permutations = 5, units = 'miles';
var locationData = fs.readFileSync( citiesFilePath, 'utf8');
var locations = locationData.split("\n").map(function(locationInfo) {
    if (!locationInfo) return;
    var locationCols = locationInfo.split("\t");
    return {
        city: locationCols[1],
        division: locationCols[10],
        country: locationCols[8],
        latitude: parseFloat(locationCols[4]).toFixed(5),
        longitude: parseFloat(locationCols[5]).toFixed(5)
    };
});
locations.sort(function(location1, location2) {
    return parseFloat(location1.latitude) - parseFloat(location2.latitude);
});
var locationMap = {};
for (var i = 0; i < locations.length; i++) {
    var location = locations[i];
    if (!location) continue;
    latKey = parseFloat(location.latitude).toFixed(2);
    lonKey = parseFloat(location.longitude).toFixed(2);
    var key = latKey+","+lonKey;
    if (locationMap[key]) {
        locationMap[key].push(location);
        continue;
    }
    locationMap[key] = [location];
}
var Geolocation = {
    locations : locationMap,
    nearbyLocations : [],
    findNearbyLocations : function(position, callback) {
        this.performGeoSearch(permutations,offset,position.lat,position.lon);
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
            for (var j = 0; j < 2*m+1; j++) {
                var locations = this.locations[(lats[i]+','+lons[j])];
                if (!locations) continue;
                for (var k = 0; k < locations.length; k++) {
                    this.performCalculation(locations[k], latitude, longitude);
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
        location.distance = this.distanceBetween(latitude, longitude, location.latitude, location.longitude);
        location.units = units;
        this.nearbyLocations.push(location);
    },
    distanceBetween : function(lat1, lon1, lat2, lon2){
        var p1 = radiansConversion*lat1, p2 = radiansConversion*lat2,
            dp = radiansConversion*(lat2-lat1), dg = radiansConversion*(lon2-lon1),
            alpha = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dg/2) * Math.sin(dg/2),
            conversion = 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1-alpha));
        return radius * conversion;
    }
};
module.exports = Geolocation;
