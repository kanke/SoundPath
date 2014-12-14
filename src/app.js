(function (document) {
  'use strict';

  function initialize() {
    var stylesArray = [{"featureType":"water","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},{"featureType":"landscape","stylers":[{"color":"#f2e5d4"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"administrative","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"road"},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{},{"featureType":"road","stylers":[{"lightness":20}]}];

    var currentLocation = soundpath.Geolocation.currentLocation(),
        myLatlng = new google.maps.LatLng(currentLocation.coords.latitude, currentLocation.coords.longitude),
        mapOptions = {
          center: { lat: myLatlng.lat(), lng: myLatlng.lng() },
          zoom: 15,
          styles: stylesArray,
          disableDefaultUI: true,
        },
        map = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);


    var marker = new google.maps.Marker({
      position: myLatlng,
      map: map,
      title: 'Hello World!',
    });
    var markers = [];


    soundpath.Geolocation.on('position:changed', function (position) {
      marker.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
    });


    function addMarkerForDroppedTrack(track) {
      markers.push(new google.maps.Marker({
        position: new google.maps.LatLng(track.latitude, track.longitude),
        map: map,
        track: track,
        title: track.title,
        icon: 'assets/marker-icon-5.png',
      }));
    }


    document.addEventListener('trackchange', function (event) {
      if (!event.detail.skipped) {
        var pos = marker.getPosition();
        soundpath.Service.dropTrack(event.detail.previousTrack, {
          latitude: pos.lat(),
          longitude: pos.lng(),
        });
      }
    });


    soundpath.Service.on('track:dropped', function (track, option) {
      addMarkerForDroppedTrack(track);
    });


    $('.paperbox').on('click', function () {
      var $clicked = $(this);
      for (var i = 0; i < markers.length; i++) {
        markers[i].setVisible(false);
      }

      $.each($('.paperbox'), function () {
        if ((!$(this).attr('checked') && $(this).data('genre') !== $clicked.data('genre'))
           || ($(this).attr('checked') && $(this).data('genre') === $clicked.data('genre'))) {
          return;
        }

        var regex = new RegExp($(this).data('genre'), 'i');
        for (var i = 0; i < markers.length; i++) {
          if (regex.test(markers[i].track.genre)) {
            markers[i].setVisible(true);
          }
        }
      });
    });


    soundpath.Service.ready()
      .then(function () {
        soundpath.Service.droppedTracks()
          .then(function (tracks) {
            console.log(3, tracks);
            for (var i = 0; i < tracks.length; i++) {
              addMarkerForDroppedTrack(tracks[i]);
            }
          });
      });
  }

  google.maps.event.addDomListener(window, 'polymer-ready', initialize);
}).call(this, document);
