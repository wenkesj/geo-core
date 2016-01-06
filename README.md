# geo-core #

Toolkit that includes fast look up of locations by latitude and longitude pairs.

```sh
npm install geo-core --save
```

### Requiring ###

```js
var Geolocation = require('geo-core')
```
### Constructing ###

Create an instance of the Geolocation class. When constructing, the manager will perform a preprocess of the ** cities5000.txt ** file. This basically contains all cities with a population of 5000 or above.

```js
var GeoManager = new Geolocation();
```
#### Options ####

GeoLocation also takes options to override defaults for any reason.

```js
var GeoManager = new Geolocation({
  radiansConversion: Math.PI / 2,
  radius: 3959,
  units: 'miles',
  minimumLocations: 3
});
```

| Property | Type | Description | Default |
|-|-|-|-|
| radiansConversion | Float | List of messages to display | &pi; / 180 |
| radius | Integer | Radius of the spherical object, defaults to ** Earth **. | 3959 |
| units | String | Unit of measurement corresponding to the ** radius ** | 'miles' |
| minimumLocations | Integer | Minimum number of nearby locations returned. | 3 |

### API ###
A ** GeoManager ** instance exposes the following functions:

`findNearbyLocations(Object, Function)`

Returns an array of ** Geolocation Objects ** closest to the supplied ** Origin Location Object **

```js
GeoManager.findNearbyLocations({
  lat: '35.73265',
  lon: '-78.85029'
}, function(locations) {
  // ... Array of geolocation objects.
});
```

#### Geolocation Friendly Objects ####
** Origin Location Object **

| Property | Type | Description |
|-|-|-|
| lon | String (Float) | ** Longitude ** coordinate associated with the origin position. |
| lat | String (Float) | ** Latitude ** coordinate associated with the origin position. |

** Geolocation Object **

| Property | Type | Description |
|-|-|-|
| city | String (Float) | ** City ** associated with the location. |
| division | String (Float) | ** Division ** / ** Province ** / ** State ** associated with the location. |
| country | String (Float) | ** Country ** associated with the location. |
| population | String (Float) | Total ** population ** of the location. |
| longitude | String (Float) | ** Longitude ** coordinate associated with the location. |
| latitude | String (Float) | ** Latitude ** coordinate associated with the location. |
| distance | String (Float) | ** Distance ** away from the origin to the location. |
| units | String (Float) | Unit of measure associated with the ** distance ** |

** geocore ** has no dependencies other than the [cities5000.txt](http://download.geonames.org/export/dump/).

#### Special Thanks ####
+ Austin Kelleher
+ Phil Gates-Idem
+ Mark Smith-Guerrero
