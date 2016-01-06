/*jshint -W030 */
var chai = require('chai');
chai.config.includeStack = true;
chai.should();
var expect = chai.expect;
var assert = chai.assert;
var Geolocation = require('../index');

describe('geolocation', function() {
  var geolocation;
  describe('with default options', function() {
    it('should create a new geolocation with default options', function(done) {
      geolocation = new Geolocation();
      expect(geolocation.radius).to.equal(3959);
      expect(geolocation.permutations).to.equal(5);
      expect(geolocation.units).to.equal('miles');
      expect(geolocation.minimumLocations).to.equal(3);
      expect(geolocation.radiansConversion).to.equal(Math.PI / 180);
      assert(Array.isArray(geolocation.nearbyLocations));
      done();
    });
    it('should find a minimum number of locations nearby with the default options', function(done) {
      geolocation.findNearbyLocations({
        lat: '35.73265',
        lon: '-78.85029'
      }, function(locations) {
        assert(geolocation.minimumLocations <= locations.length);
        locations.forEach(function(location) {
          expect(location.city).to.exist;
          expect(location.division).to.exist;
          expect(location.country).to.exist;
          expect(location.population).to.exist;
          expect(location.latitude).to.exist;
          expect(location.longitude).to.exist;
          expect(location.distance).to.exist;
          expect(location.units).to.exist;
        });
        done();
      });
    });
    it('should return an error object when nearby locations exceed a limit', function(done) {
      geolocation.findNearbyLocations({
        lat: '-13.7036473',
        lon: '-148.9712961'
      }, function(locations) {
        var erroneousLocation = locations[0];
        assert(locations.length === 1);
        expect(erroneousLocation).to.exist;
        expect(erroneousLocation.error).to.exist;
        assert(typeof(erroneousLocation.error) === 'string');
        expect(erroneousLocation.attempts).to.exist;
        done();
      });
    });
  });
});
