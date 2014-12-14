window.soundpath = {};

window.soundpath.Geolocation = (function (Q) {
  'use strict';

  var exports = {},
      listeners = {},
      cachedPosition = {
        coords: {
          latitude: 51.528,
          longitude: -0.081,
        }
      };

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(function (position) {
      cachedPosition = position;
      console.log('UPDATE POSITION', position);

      var array = listeners['position:changed'] || [];
      for (var i = 0; i < array.length; i++) {
        array[i](cachedPosition);
      }
    }, function (error) {
      console.error('An error has occurred:', error);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert('Permission has been denied');
          break;

        case error.POSITION_UNAVAILABLE:
          alert('Location information is unavailable');
          break;

        case error.TIMEOUT:
          alert('The request to get the current location timed out.');
          break;

        case error.UNKNOWN_ERROR:
          alert('An unknown error has occurred.');
          break;
      }
    });
  } else {
    alert('Geolocation is not supported');
  }


  exports.currentLocation = function () {
    return cachedPosition;
  };


  exports.on = function (key, listener) {
    listeners[key] = listeners[key] || [];
    listeners[key].push(listener);
  };


  return exports;
}).call(this, Q);


window.soundpath.Service = (function (Q, SC, Parse) {
  'use strict';

  var exports = {},
      initDeferred = Q.defer(),
      listeners = {},
      cachedTracks = [],
      CLIENT_ID = 'cc6b70490609b09c4435861aff11fc6c';

  SC.initialize({
      client_id: CLIENT_ID,
      redirect_uri: 'http://localhost:3000'
  });


  Parse.initialize("4RrzyjoWGy7UBIRvvurcSjAvHjb1oPNWNUUuJsBt", "b6WEyaFWuZwOt0yG0a1mmwchjQ6WmrHb8sMStp9p");
  var Music = Parse.Object.extend("Music");
  var query = new Parse.Query(Music);

  query.find({
    success: function(tracks) {
      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        cachedTracks.push({
          title: track.attributes.song_title,
          genre: track.attributes.stream_url,
          artist: track.attributes.artist,
          stream_url: track.attributes.stream_url,
        });
      }

      initDeferred.resolve();
    }
  });


  exports.ready = function () {
    return initDeferred.promise;
  };


  exports.seedTracks = function (options) {
    var deferred = Q.defer();

    SC.get('/tracks', options, function (tracks) {
      Array.prototype.push.apply(cachedTracks, tracks);
      deferred.resolve();
    });

    return deferred.promise;
  };


  exports.on = function (key, callback) {
    listeners[key] = listeners[key] || [];
    listeners[key].push(callback);
  };


  exports.dropTrack = function (track, options) {
    console.log(track.title, 'DROPPED AT', options.latitude, options.longitude);

    var list = listeners['track:dropped'] || [];

    for (var i = 0; i < list.length; i++) {
      list[i](track, options);
    }
  };


  exports.nextTrack = function () {
    var deferred = Q.defer();

    deferred.resolve(cachedTracks.shift());

    return deferred.promise;
  };


  return exports;
}).call(this, Q, SC, Parse);
