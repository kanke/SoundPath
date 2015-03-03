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
      cachedDroppedTracks = [],
      trackHistory = [],
      cachedTracks = [],
      CLIENT_ID = 'cc6b70490609b09c4435861aff11fc6c';

  SC.initialize({
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin,
  });


  Parse.initialize("4RrzyjoWGy7UBIRvvurcSjAvHjb1oPNWNUUuJsBt", "b6WEyaFWuZwOt0yG0a1mmwchjQ6WmrHb8sMStp9p");
  var Music = Parse.Object.extend("Music");
  var query = new Parse.Query(Music);

  function soundCloudToSoundPath(track) {
    return {
      soundcloud_id: track.attributes.soundcloud_id,
      title: track.attributes.song_title,
      genre: track.attributes.genre,
      artist: track.attributes.artist,
      stream_url: track.attributes.stream_url,
      parse_object: track,
      latitude: track.attributes.latitude,
      longitude: track.attributes.longitude,
      // waveform_url: track.attributes.waveform_url,
    };
  }

  query.doesNotExist('latitude').find({
    success: function(tracks) {
      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        cachedTracks.push(soundCloudToSoundPath(track));
      }

      initDeferred.resolve();

      // (new Parse.Query(Music)).find().then(function (tracks) {
      //   var coords = soundpath.Geolocation.currentLocation().coords;
      //   console.log(100, tracks);
      //
      //   for (var i = 0; i < tracks.length/2; i++) {
      //     tracks[i].set('latitude', null);
      //     tracks[i].set('longitude', null);
      //     tracks[i].save();
      //   }
      // });
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

    track.latitude = options.latitude;
    track.longitude = options.longitude;
    track.parse_object.set('latitude', options.latitude);
    track.parse_object.set('longitude', options.longitude);
    track.parse_object.save();

    var list = listeners['track:dropped'] || [];
    for (var i = 0; i < list.length; i++) {
      list[i](track, options);
    }
  };


  exports.droppedTracks = function () {
    var deferred = Q.defer(),
        query = new Parse.Query(Music);

    query.find({
      success: function (tracks) {
        var array = [];
        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].attributes.longitude) {
            array.push(soundCloudToSoundPath(tracks[i]))
          }
        }

        cachedDroppedTracks = array;
        deferred.resolve(array);
      },
      error: function () {
        deferred.reject();
      }
    });


    return deferred.promise;
  };


  function getClosestDrop(coords) {
    if (!cachedDroppedTracks.length) {
      return undefined;
    }

    var index = 0,
        dx = (coords.latitude - cachedDroppedTracks[index].latitude),
        dy =  (coords.longitude - cachedDroppedTracks[index].longitude),
        dist = dx*dx + dy*dy;

    for (var i = 1; i < cachedDroppedTracks.length; i++) {
      var dx2 = (coords.latitude - cachedDroppedTracks[i].latitude),
          dy2 =  (coords.longitude - cachedDroppedTracks[i].longitude),
          dist2 = dx2*dx2 + dy2*dy2;

      if (dist2 < dist) {
        dist = dist2;
        index = i;
      }
    }


    return cachedDroppedTracks.splice(index, 1)[0];
  }


  exports.nextTrack = function () {
    var deferred = Q.defer(),
        candidate = getClosestDrop(soundpath.Geolocation.currentLocation().coords);

    while (candidate) {
      if (trackHistory.indexOf(candidate.soundcloud_id) === -1) {
        trackHistory.push(candidate.soundcloud_id);
        break;
      } else {
        candidate = getClosestDrop(soundpath.Geolocation.currentLocation().coords);
      }
    }

    if (!candidate) {
      candidate = cachedTracks.unshift();
    }

    deferred.resolve(candidate);

    return deferred.promise;
  };


  return exports;
}).call(this, Q, SC, Parse);
