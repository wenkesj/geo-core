__geo-core__

`npm install geo-core --save`

A package to parse a [geonames](http://geonames.org/) cities file into JSON.
Included is the *cities5000.txt* from [geonames downloads](http://download.geonames.org/export/dump/)
```javascript
    /**
        Include the geocore object.
     */
    var geocore = require("geo-core")
    /**
        @param lat is the latidude coordinate
        @param lon is the longitude coordinate
     */
    var Apex_NC = {
        lat: '35.73265',
        lon: '-78.85029'
    };
    geocore.findNearbyLocations( Apex_NC, function(nearby) {
        /**
            @return nearby will be an array of locations nearby!
            [{
                city: "cityName",
                division: "provinceName/stateName/countryName",
                country: "countryName",
                latitude: "latitude",
                longitude: "longitude",
                population: "2s comp of bigint (Readable number)"
                distance: "distanceFromCoord"
                units: "unitOfMeasurement" -- Defaults to miles
            },
                ...
            ]
         */
    });
```
_geocore_ has no dependencies other than included the [geonames](http://geonames.org/) file.
