var LocationIndexItem = React.createClass({
  render: function () {

    return (
      <div className="location-index-item group">

        <figure className="location-index-item-img">
          <img src={this.props.location.img_url}/>
        </figure>

        <h2 className="location-index-item-name">
          <Link to={"/locations/" + this.props.location.name}>
            {this.props.location.name}
          </Link>
        </h2>

        <label className="location-index-item-website">
          <a href="#">
            {this.props.location.website}
          </a>
        </label>

        <label className="location-index-item-description">
          {this.props.location.description}
        </label>

        <div className="location-index-item-details">
          <h3>{this.props.location.location_type}</h3>

          <label className="location-index-item-price-range">
            {this.props.location.price_range}
          </label>
        </div>

        <div className="location-index-item-contact-details">
          <label className="location-index-item-address">
            {this.props.location.street_address}
          </label>

          <label className="location-index-item-address">
            {this.props.location.city}, {this.props.location.state} {this.props.location.zipcode}
          </label>

          <label className="location-index-item-phone">
            {this.props.location.phone_number}
          </label>
        </div>

      </div>
    );
  }
});