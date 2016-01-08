'use strict';
/* Geolocation parses a .txt file into a JSON object sorted
* by latidude value numerically and with (latitude,longitude)
* fixed decimal indexing. The locations are then searched by
* using a closest distance calculation based on the earth as
* a sphere. The locations are then stored in an array and sorted
* by population. */

function Geolocation(options) {
  options = options ? options : {};
  this.radius = options.radius ? options.radius : 3959;
  this.permutations = 5;
  this.units = options.units ? options.units : 'miles';
  this.minimumLocations = options.minimumLocations ? options.minimumLocations : 3;
  this.offset = 0.01;
  this.radiansConversion = Math.PI / 180;
  this.nearbyLocations = [];
  this.allLocations = require('./cities5000.json');
}

Geolocation.prototype = {
  findNearbyLocations: function(position, callback) {
    this.searchByLatidudeAndLongitude(this.permutations, this.offset, position.lat, position.lon);
    this.sortNearbyLocationsByPopulation();
    var nearbyLocations = this.nearbyLocations;
    this.nearbyLocations = [];
    callback(nearbyLocations);
  },
  /* For fast lookup we search the hashmap by key -> myLatitude,myLongitude truncated to the hundreth decimal place */
  searchByLatidudeAndLongitude: function(m, offset, latitude, longitude) {
    var lats = [], lons = [];
    for (var g = -m; g < m + 1; g++) {
      lats.push((parseFloat(latitude) + parseFloat(g * offset)).toFixed(2));
      lons.push((parseFloat(longitude) + parseFloat(g * offset)).toFixed(2));
    }
    /**
    Take an extended number of permutations based on the initial 5.
    For example, this will rotate and search 5 combinations about the center ->
    -> ...
    -> myLatitude, myLongitude - 1,
    -> myLatitude, myLongitude
    -> myLatitude, myLongitude + 1
    -> ...
    */
    for (var i = 0; i < 2 * m + 1; i++) {
      for (var j = 0; j < 2 * m + 1; j++) {
        var locations = this.allLocations[(lats[i] + ',' + lons[j])];
        if (!locations) {
          continue;
        }
        for (var k = 0; k < locations.length; k++) {
          this.calculateDistanceBetweenPoints(locations[k], latitude, longitude);
        }
      }
    }
    /* In order to ensure accuracy, we want to set a minimum to the amount of locations returned. */
    if (!this.nearbyLocations[this.minimumLocations - 1]) {
      if (m > 16) {
        return this.nearbyLocations.push({
          error: 'No locations found',
          attempts: m * m
        });
      }
      return this.searchByLatidudeAndLongitude(2 * m, offset, latitude, longitude);
    }
  },
  /* This will call the distance calculation algorithm and will update the nearbyLocations array. */
  calculateDistanceBetweenPoints: function(location, latitude, longitude) {
    if (this.nearbyLocations[0]) {
      var id = this.nearbyLocations.indexOf(location);
      if (id > -1) {
        return this.nearbyLocations.splice(id, 1);
      }
    }
    location.distance = this.distanceCalculation(latitude, longitude, location.latitude, location.longitude);
    location.units = this.units;
    this.nearbyLocations.push(location);
  },
  /* This calculates the distance between 2 points on a spherical plane and converts it to miles. */
  distanceCalculation: function(lat1, lon1, lat2, lon2){
    var p1 = this.radiansConversion * lat1;
    var p2 = this.radiansConversion * lat2;
    var dp = this.radiansConversion * (lat2 - lat1);
    var dg = this.radiansConversion * (lon2 - lon1);
    var alpha = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dg / 2) * Math.sin(dg / 2);
    var conversion = 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1 - alpha));
    return this.radius * conversion;
  },
  /* This sorts the locations by greatest to smallest population. */
  sortNearbyLocationsByPopulation: function() {
    if (!this.nearbyLocations || !this.nearbyLocations[0].population) {
      return;
    }
    this.nearbyLocations.sort(function(location1, location2) {
      return location2.population - location1.population;
    });
  }
};

function preprocess() {
  var fs = require('fs');
  var path = require('path');

  /* Read and map the locations into an object. */
  var locationData = fs.readFileSync(path.normalize(path.join(__dirname, 'cities5000.txt')), 'utf8');
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

  /* Sort the locations from -/+ latidude. */
  locations.sort(function(location1, location2) {
    return parseFloat(location1.latitude) - parseFloat(location2.latitude);
  });

  /* Re map the locations to a hashmap. */
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
  return locationMap;
}

module.exports = Geolocation;
