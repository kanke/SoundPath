(function ($, document) {
  'use strict';

  function initialize() {
    var stylesArray = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];
    var myLatlng = new google.maps.LatLng(51.5033630, -0.1276250);
    var mapOptions = {
      center: { lat: myLatlng.lat(), lng: myLatlng.lng() },
      zoom: 13,
      styles: stylesArray,
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);


    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Hello World!',
      // icon: 'http://img3.wikia.nocookie.net/__cb20090314214419/ladygaga/images/2/28/Song_Icon.png',
    });
    var markers = [];


    function circleMarker() {
      marker.setPosition(new google.maps.LatLng(myLatlng.lat() + 0.05*(- 0.5 + Math.random()), myLatlng.lng() + 0.05*(- 0.5 + Math.random())));
      setTimeout(circleMarker, 1500);
    }
    circleMarker();


    var $audio = $('#app-player');
    function playTrack(track) {
      $audio[0].src = track.stream_url + '?client_id=cc6b70490609b09c4435861aff11fc6c';
      $audio[0].play();
      console.log('NOW PLAYING', track.title);
    }


    soundpath.Service.seedTracks({ q: 'Linkin Park' })
      .then(function () {
        var track = soundpath.Service.nextTrack();
        playTrack(track);

        $audio.on('ended', function () {
          var pos = marker.getPosition();
          soundpath.Service.dropTrack(track, {
            latitude: pos.lat(),
            longitude: pos.lng(),
          });
          new google.maps.Marker({
            position: new google.maps.LatLng(pos.lat(), pos.lng()),
            map: map,
            title: track.title,
          });

          track = soundpath.Service.nextTrack();
          playTrack(track);
        });
      });
  }

  google.maps.event.addDomListener(window, 'polymer-ready', initialize);
}).call(this, jQuery, document);
