(function() {
  var _markers = [];
  var CHANGE_EVENT = "CHANGE_EVENT";

  window.MarkerStore = $.extend({}, EventEmitter.prototype, {
    all: function () {
      return _markers.slice();
    },

    updateMarkersFromLocationStore: function (map) {
      var newLocations = LocationStore.all();

      this.removeOldMarkers();

      this.createNewMarkers(map, newLocations);

      this.emit(CHANGE_EVENT);
      // this.setMarkerLabelsToSearchIndices();
    },

    removeOldMarkers: function () {
      _markers.forEach(function (marker) {
        marker.setMap(null);
      });

      _markers = [];
    },

    addChangeListener: function (callback) {
      this.on(CHANGE_EVENT, callback);
    },

    removeChangeListener: function (callback) {
      this.removeListener(CHANGE_EVENT, callback);
    },

    createNewMarkers: function (map, newLocations) {
      newLocations.forEach(function (location) {
        var marker = this.createNewMarker(map, location);
        _markers.push(marker);
      }.bind(this));
    },

    // setMarkerLabelsToSearchIndices: function () {
    //   _markers.forEach(function (marker, idx) {
    //     marker.set('label', (idx + 1).toString());
    //   });
    // },

    determineMapBoundsAndSetCenter: function (map) {
      var zoomChangeBoundsListener =
        google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
          map.setZoom(15);
        });

      var latLngBounds = new google.maps.LatLngBounds();

      LocationStore.allLatLngObjects().forEach(function (latLng) {
        latLngBounds.extend(latLng);
      });

      // map.setCenter(latLngBounds.getCenter());
      // map.fitBounds(latLngBounds);
      map.panTo(latLngBounds.getCenter());

      setTimeout(function() {
          google.maps.event.removeListener(zoomChangeBoundsListener);
        },2000
      );
    },

    findMatchingMarker: function (location) {
      var match = false;
      var matchedMarker;

      for (var i = 0; i < _markers.length; i++) {
        if (_markers[i].locationId === location.id) {
          matchedMarker = _markers[i];
          break;
        }
      }
      return matchedMarker;
    },

    createNewMarker: function (map, location) {
      var coord = {lat: location.lat, lng: location.lng};

      var marker = new google.maps.Marker({
        position: coord,
        locationId: location.id,
        map: map
      });

      return marker;
    },
  });
}());
