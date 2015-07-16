var fs = require('fs');
var path = require('path');
var citiesFilePath = path.normalize(path.join(__dirname, 'cities5000.txt'));

/**
    Geolocation parses a .txt file into a JSON object sorted
    by latidude value numerically and with (latitude,longitude)
    fixed decimal indexing. The locations are then searched by
    using a closest distance calculation based on the earth as
    a sphere. The locations are then stored in an array and sorted
    by population.
 *
 *  @const radius is the radius of the earth in @const units.
 *  @const radiansConversion converts degrees to radians.
 *  @const offset is the latidude and longitude offset for lookup
 *  @const permutations are the number of initial iterations about
 *  the center point.
 */

var radius = 3959,
    radiansConversion = Math.PI/180,
    offset = 0.01,
    permutations = 5,
    units = 'miles',
    minimumLocations = 3;

/**
    Read and map the locations into an object.
 */
var locationData = fs.readFileSync( citiesFilePath, 'utf8');
var locations = locationData.split('\n').map(function(locationInfo) {
    if (!locationInfo) {
        return;
    }

    var locationCols = locationInfo.split('\t');
    return {
        city: locationCols[1],
        division: locationCols[10],
        country: locationCols[8],
        population: locationCols[14],
        latitude: parseFloat(locationCols[4]).toFixed(5),
        longitude: parseFloat(locationCols[5]).toFixed(5)
    };
});

/**
    Sort the locations from -/+ latidude.
 */
locations.sort(function(location1, location2) {
    return parseFloat(location1.latitude) - parseFloat(location2.latitude);
});
/**
    Re map the locations to a hashmap.
 */
var locationMap = {};
for (var i = 0; i < locations.length; i++) {
    var location = locations[i];

    if (!location) {
        continue;
    }

    var latKey = parseFloat(location.latitude).toFixed(2);
    var lonKey = parseFloat(location.longitude).toFixed(2);
    var key = latKey + ',' + lonKey;

    if (locationMap[key]) {
        locationMap[key].push(location);
        continue;
    }

    locationMap[key] = [location];
}
var Geolocation = {
    allLocations : locationMap,
    nearbyLocations : [],
    /**
        This is where the functions are all bundled into in order to find the nearbyLocations.
     */
    findNearbyLocations : function(position, callback) {
        this.searchByLatidudeAndLongitude(permutations, offset, position.lat, position.lon);
        this.sortNearbyLocationsByPopulation();
        callback(this.nearbyLocations);
        this.nearbyLocations = [];
    },
    /**
        For fast lookup we search the hashmap by key -> myLatitude,myLongitude truncated to the hundreth decimal place
     */
    searchByLatidudeAndLongitude : function(m,offset,latitude,longitude) {
        var lats = [], lons = [];
        for (var g = -m; g < m + 1; g++) {
            lats.push((parseFloat(latitude)+parseFloat(g*offset)).toFixed(2));
            lons.push((parseFloat(longitude)+parseFloat(g*offset)).toFixed(2));
        }
        /**
            Take an extended number of permutations based on the initial 5.
            For example, this will rotate and search 5 combinations about the center ->
                -> ...
                -> myLatitude, myLongitude-1,
                -> myLatitude,myLongitude
                -> myLatitude,myLongitude+1
                -> ...
         */
        for (var i = 0; i < 2*m+1; i++) {
            for (var j = 0; j < 2*m+1; j++) {
                var locations = this.allLocations[(lats[i]+','+lons[j])];

                if (!locations) {
                    continue;
                }

                for (var k = 0; k < locations.length; k++) {
                    this.calculateDistanceBetweenPoints(locations[k], latitude, longitude);
                }
            }
        }
        /**
            In order to ensure accuracy, we want to set a minimum to the amount of locations returned.
         */
        if (!this.nearbyLocations[minimumLocations-1]) {
            if (m > 16) {
                return this.nearbyLocations.push({
                    name: 'Error',
                    type: 'No locations found, '+m*m+' attempts.'
                });
            }
            return this.searchByLatidudeAndLongitude(2*m,offset,latitude,longitude);
        }
    },
    /**
        This will call the distance calculation algorithm and will update the nearbyLocations array.
     */
    calculateDistanceBetweenPoints : function(location,latitude,longitude) {
        if (this.nearbyLocations[0]) {
            var id = this.nearbyLocations.indexOf(location);

            if (id > -1) {
                return this.nearbyLocations.splice(id,1);
            }
        }
        location.distance = this.distanceCalculation(latitude, longitude, location.latitude, location.longitude);
        location.units = units;
        this.nearbyLocations.push(location);
    },
    /**
        This calculates the distance between 2 points on a spherical plane and converts it to miles.
     */
    distanceCalculation : function(lat1, lon1, lat2, lon2){
        var p1 = radiansConversion*lat1, p2 = radiansConversion*lat2,
            dp = radiansConversion*(lat2-lat1), dg = radiansConversion*(lon2-lon1),
            alpha = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dg/2) * Math.sin(dg/2),
            conversion = 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1-alpha));
        return radius * conversion;
    },
    /**
        This sorts the locations by greatest to smallest population.
     */
    sortNearbyLocationsByPopulation : function() {
        if (!this.nearbyLocations || !this.nearbyLocations[0].population) {
            return;
        }

        this.nearbyLocations.sort(function(location1, location2) {
            return location2.population - location1.population;
        });
    }
};
module.exports = Geolocation;
