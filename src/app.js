(function (document) {
  'use strict';

  function initialize() {
/**************USE ME BYRAN************
    var Music = Parse.Object.extend("Music");
    var query = new Parse.Query(Music);
    query.get("u85iVF1ZHg", {
    success: function(music) {
      window.alert(music.get("genre"));

      // The object was retrieved successfully.
  },
  error: function(object, error) {
    alert("Error: " + error.code + " " + error.message);
    // The object was not retrieved successfully.
    // error is a Parse.Error with an error code and message.
  }
});

MORE----->> https://parse.com/docs/js_guide#objects
/***************************************/
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

    function circleMarker() {
      marker.setPosition(new google.maps.LatLng(myLatlng.lat() + 0.01*(- 0.5 + Math.random()), myLatlng.lng() + 0.01*(- 0.5 + Math.random())));
      setTimeout(circleMarker, 1500);
    }
    circleMarker();


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
      var pos = marker.getPosition();
      new google.maps.Marker({
        position: new google.maps.LatLng(pos.lat(), pos.lng()),
        map: map,
        title: track.title,
        icon: 'assets/marker-icon-5.png',
      });
    });
  }

  google.maps.event.addDomListener(window, 'polymer-ready', initialize);
}).call(this, document);
