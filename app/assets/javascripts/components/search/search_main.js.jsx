var success = function () {
  this.setState(
    {
      showLocTypeAutoCompleteList: false,
      showLocAreaAutoCompleteList: false
    }
  );
};

var failure = function (errMsg) {
  this.setState(
    {
      errMsg: errMsg,
      showLocTypeAutoCompleteList: false,
      showLocAreaAutoCompleteList: false
    }
  );
};

var SearchMain = React.createClass({
  mixins: [ReactPersistentState, ReactRouter.History],

  getInitialState: function () {
    return (
      {
        locType: "",
        locArea: "",
        // default distance radius is 10 miles
        distanceRange: "1", // miles
        priceRange: "All",
        showLocTypeAutoCompleteList: false,
        showLocAreaAutoCompleteList: false,
        errMsg: null
      }
    );
  },

  componentWillMount: function () {
    this.setPId('location_search_params');
    this.setPStorage(this.localStorage);
    this.restorePState();
  },

  componentDidMount: function () {
    this.intervalId = setInterval(function () {
      this.setPState({
        locType: this.state.locType,
        locArea: this.state.locArea,
        distanceRange: this.state.distanceRange,
        priceRange: this.state.priceRange,
        showLocTypeAutoCompleteList: this.state.showLocTypeAutoCompleteList,
        showLocAreaAutoCompleteList: this.state.showLocAreaAutoCompleteList,
        errMsg: null
      });
    }.bind(this), 1000);

    this.setCurrentLocation();

    LocTypeAutoCompleteStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function () {
    clearInterval(this.intervalId);

    LocTypeAutoCompleteStore.removeChangeListener(this._onChange);
  },

  _onChange: function () {
    this.forceUpdate();
  },

  // set current locaiton to current city
  setCurrentLocation: function () {
    navigator.geolocation.getCurrentPosition(function(e) {
      var lat = e.coords.latitude;
      var lng = e.coords.longitude;

      this.setAddressStateToCityState(lat, lng);
    }.bind(this));
  },

  setAddressStateToCityState: function (lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    var geocoder = new google.maps.Geocoder();

    var city;

    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        nearestLocation = results[0];

        for (var i = 0; i < nearestLocation.address_components.length; i++) {
          for (var j = 0; j < nearestLocation.address_components[i].types.length; j++) {
            if (nearestLocation.address_components[i].types[j] == "administrative_area_level_1") {
                city = nearestLocation.address_components[i].long_name;
                break;
            }
          }
        }
      }

      this.setState({locArea: city});
    }.bind(this));
  },

  buildSearchObject: function () {
    var searchParams = {
      searchType: this.state.locType,
      searchArea: this.state.locArea,
      distanceRange: this.state.distanceRange,
      priceRange: this.state.priceRange
    };

    return searchParams;
  },

  handleSearchSubmit: function (event) {
    if (event) {
      event.preventDefault();
    }

    var searchParams = this.buildSearchObject();

    this.getLocationsAndPushState(searchParams);
  },

  getLocationsAndPushState: function (searchParams) {
    ApiLocationUtil.fetchLocations(searchParams, success.bind(this), failure.bind(this));

    this.history.pushState(null, "search/", searchParams);
  },

  handlePriceRangeFilter: function (priceRange) {
    var searchParams = this.buildSearchObject();
    searchParams.priceRange = priceRange;

    this.getLocationsAndPushState(searchParams);
  },

  handleDistanceRangeFilter: function (distanceRange) {
    var searchParams = this.buildSearchObject();
    searchParams.distanceRange = distanceRange;

    this.getLocationsAndPushState(searchParams);
  },

  autoCompleteLocationType: function (event) {
    locTypePartial = event.currentTarget.value;

    this.setState(
      {
        locType: locTypePartial,
        showLocTypeAutoCompleteList: true
      }
    );

    ApiLocationUtil.fetchLocationTypes(locTypePartial);
  },


  autoCompleteLocationArea: function (event) {
    locAreaPartial = event.currentTarget.value;

    this.setState(
      {
        locArea: event.currentTarget.value,
        showLocAreaAutoCompleteList: true
      }
    );
    // ApiLocationUtil.fetchLocationAreas(this.state.locArea);
  },

  selectLocArea: function (event) {
    var locArea = event.currentTarget.innerText;

    this.setState(
      {
        locArea: locArea,
        showLocAreaAutoCompleteList: false
      }
    );
  },

  selectLocType: function (event) {
    var locType = event.currentTarget.innerText;

    this.setState(
      {
        locType: locType,
        showLocTypeAutoCompleteList: false
      }
    );
  },

  setPriceRangeFilter: function (event) {
    event.preventDefault();

    var priceRange = event.currentTarget.value;

    if (NomNomsApp.search_auto) {
      this.handlePriceRangeFilter(priceRange);
    }

    this.setState({ priceRange: event.currentTarget.value });
  },

  setDistanceRangeFilter: function (event) {
    event.preventDefault();

    var distanceRange = event.currentTarget.value;

    if (NomNomsApp.search_auto) {
      this.handleDistanceRangeFilter(distanceRange);
    }

    this.setState({ distanceRange: event.currentTarget.value });
  },

  render: function () {
    var locTypeAutoCompleteList, locAreaAutoCompleteList, errMsg;

    if (this.state.errMsg) {
      errMsg = <span className="location-search-error-msg">this.state.errMsg</span>;
    }

    var handleKeyPress = function (e) {
      if (e.which === 13) {
        this.handleSearchSubmit(e);
      }
    };

    if (this.state.showLocTypeAutoCompleteList) {
      locTypeAutoCompleteList = LocTypeAutoCompleteStore.matches().map(function (locTypeMatch, i) {
        return <li key={i} onClick={this.selectLocType} value={locTypeMatch}>{locTypeMatch}</li>;
      }.bind(this));
    }

    if (this.state.showLocAreaAutoCompleteList) {
      locAreaAutoCompleteList = LocAreaAutoCompleteStore.matches().map(function (locAreaMatch, i) {
        return <li key={i} onClick={this.selectLocArea} value={locAreaMatch}>{locAreaMatch}</li>;
      }.bind(this));
    }

    var priceRangeButtons = priceRangeMapping.map(function (priceRange, idx) {
      var klass = this.state.priceRange === priceRange[idx] ? "active" : "";

      return <PriceRangeButton
        key={idx}
        val={priceRange[idx]}
        klass={"price-range-button " + klass}
        setPriceRangeFilter={this.setPriceRangeFilter} />;
    }.bind(this));

    var distanceRangeButtons = distanceRangeMapping.map(function (distanceRange, idx) {
      var klass = this.state.distanceRange === distanceRange[idx][1] ? "active" : "";

      return <DistanceRangeButton
        key={idx}
        val={distanceRange[idx][1]}
        label={distanceRange[idx][2]}
        klass={"distance-range-button " + klass}
        setDistanceRangeFilter={this.setDistanceRangeFilter} />;
    }.bind(this));

    return (
      <div className="location-search group">
        <form className="group" onSubmit={ this.handleSearchSubmit } onKeyPress={ handleKeyPress.bind(this) }>
          <div className="location-search-filter-wrapper group">
            <div className="location-search-bars-wrapper group">
              <label className="location-search-pseudo">

                <span className="location-pseudo-input-text">Find</span>

                <input className="location-type-search-input"
                  type="text"
                  value={this.state.locType}
                  placeholder="Location type (restaurant, bar, etc)"
                  onChange={this.autoCompleteLocationType}/>

                <ul className="location-type-autocomplete-list">
                  { locTypeAutoCompleteList }
                </ul>

              </label>

              <label className="location-search-pseudo">
                <span className="location-pseudo-input-text">Near</span>
                <input className="location-area-search-input"
                  type="text"
                  value={this.state.locArea}
                  onChange={this.autoCompleteLocationArea}/>
              </label>

              <ul className="location-area-autocomplete">
                { locAreaAutoCompleteList }
              </ul>

            </div>

            <div className="location-filter-options-wrapper group">

              <ul className="location-filter-price-range">
                { priceRangeButtons }
              </ul>

              <ul className="location-filter-distance">
                { distanceRangeButtons }
              </ul>

            </div>
          </div>

          <div className="location-search-button">
            <button type="Submit">🔍</button>
          </div>

        </form>

        { errMsg }
      </div>
    );
  }
});