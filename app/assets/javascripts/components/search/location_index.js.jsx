var LocationIndex = React.createClass({
  mixins: [ReactPersistentState],

  getInitialState: function () {
    return ({ locations: LocationStore.all() });
  },

  componentDidMount: function () {
    this.setPId('location_index');
    this.setPStorage(this.localStorage);
    setInterval(function () {
      this.setPState({
        locations: this.state.locations
      });
    }.bind(this), 1000);
    this.restorePState();

    LocationStore.addLocationIndexChangeListener(this._onChange);
    MarkerStore.addMarkersUpdatedListener(this._onMarkersUpdatedChange);
  },

  componentWillUnmount: function () {
    LocationStore.removeLocationIndexChangeListener(this._onChange);
    MarkerStore.removeMarkersUpdatedListener(this._onMarkersUpdatedChange);
  },

  _onChange: function () {
    this.setState({ locations: LocationStore.all() });
  },

  _onMarkersUpdatedChange: function () {
    this.forceUpdate();
  },

  render: function () {
    var locationIndexItems;

    if (this.state.locations)  {
      locationIndexItems = this.state.locations.map( function(location, idx) {
        return <LocationIndexItem
          key={location.id}
          location={location}
          marker={MarkerStore.findMatchingMarker(location)}
          />;
      });
    }

    return (
      <div className="location-index">
        {locationIndexItems}
      </div>
    );
  }
});
