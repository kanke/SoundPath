window.soundpath = {};

window.soundpath.Service = (function (Q) {
  'use strict';

  var exports = {},
      cachedTracks = [],
      CLIENT_ID = 'cc6b70490609b09c4435861aff11fc6c';

  SC.initialize({
      client_id: CLIENT_ID,
      redirect_uri: 'http://localhost:3000'
  });


  exports.seedTracks = function (options) {
    var deferred = Q.defer();

    SC.get('/tracks', options, function (tracks) {
      var stats = {};
      var i = tracks.length;
      while (i--) {
        var track = tracks[i];
        stats[track.genre] = stats[track.genre] || 0;
        stats[track.genre]++;
      }
      console.log(1, tracks);
      console.log(2, stats);
      Array.prototype.push.apply(cachedTracks, tracks);
      deferred.resolve();
    });

    return deferred.promise;
  };


  exports.dropTrack = function (track, options) {
    console.log(track.title, 'DROPPED AT', options.latitude, options.longitude);
  };


  exports.nextTrack = function () {
    return cachedTracks.shift();
  };


  return exports;
}).call(this, Q);
