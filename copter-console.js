var arDrone = require('ar-drone');
var Q = require('q');
var client = arDrone.createClient();

client.config('general:navdata_demo', 'TRUE');
client.config('control:altitude_max', 100000);
client.disableEmergency();
client.stop();

var currentAltitude = 0;

var currentData = {};
client.on("navdata", function( data ) {
  currentData = data;
});

var rotatePromise = function(expectedDegree) {
  var deferred = Q.defer();
  var i = setInterval(function() {
    if (currentData && currentData.demo.clockwiseDegrees) {
      var currentDegree = currentData.demo.clockwiseDegrees;
      if ((currentDegree / expectedDegree) < 1.01 && (currentDegree / expectedDegree) > 0.99) {
        client.stop();
        clearInterval(i);
        deferred.resolve();
      } else if (currentDegree < altitude) {
        console.log('Going up to ' + altitude);
        client.up(1);
      } else {
        console.log('Going down to ' + altitude);
        client.down(1);
      }
    }
  }
  return deferred.promise;
  }

  var altitudePromise = function(altitude){
    var deferred = Q.defer();
    var i = setInterval(function() {
      if (currentData && currentData.demo) {
        var cur_alt = currentData.demo.altitude;
        if ((cur_alt / altitude) < 1.01 && (cur_alt / altitude) > 0.99) {
          client.stop();
          clearInterval(i);
          console.log('Reached altitude ', altitude);
          deferred.resolve();
        } else if (cur_alt < altitude) {
          console.log('Going up to ' + altitude);
          client.up(1);
        } else {
          console.log('Going down to ' + altitude);
          client.down(1);
        }
      }
    }, 100);
    return deferred.promise;
  };

var takeoff = function(){
  client.takeoff();
  var deferred = Q.defer();
  var i = setInterval(function(){
    if (currentData && currentData.demo && currentData.demo.altitude > .7) {
      clearInterval(i);
      deferred.resolve();
    }
  }, 50);
  return deferred.promise;
};

var runProgram = function() {
  var result = Q.resolve(takeoff());
  [2,1,3].forEach(function(altitude){
    result = result.then(function(){
      return altitudePromise(altitude);
    });
  });
  result.then(function(){
    console.log('Landing');
    client.land();
  });
};

/*
   client.takeoff();
   var altitudes = [];
   var lastPromise = null;
   [2,3,1].forEach(function(altitude){
   if (lastPromise == null) {
   lastPromise = altitudePromise(altitude);
   } else {
   lastPromise.then(function(){
   altitudePromise(altitude);
   });
   }
   altitudes.push(currentPromise);
   });
   Q.all(altitudes).then(function(){
   client.stop();
   client.land();
   });
   */
//var lastAltitude = null;
//var maxAltitude = null;
//var altitudeInterval = setInterval(function() {
//console.log(currentData.demo.altitude, lastAltitude);
//if (lastAltitude > 1.5 && Math.abs(lastAltitude - currentData.demo.altitude) < .005) {
//clearInterval(altitudeInterval);
//console.log('MAX_ALTITUDE', lastAltitude);
//maxAltitude = lastAltitude;
//} else if(currentData.demo.altitude > 0) {
//lastAltitude = currentData.demo.altitude;
//}
//}, 500);

//client.up(1);
//

client.createRepl();
