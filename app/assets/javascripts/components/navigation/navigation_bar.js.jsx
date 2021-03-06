var NavigationBar = React.createClass({
  componentDidMount: function () {
    CurrentUserStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function () {
    CurrentUserStore.removeChangeListener(this._onChange);
  },

  _onChange: function () {
    this.forceUpdate();
  },

  render: function () {
    var authComponent;

    if (CurrentUserStore.isLoggedIn()) {
      authComponent = <UserLoggedIn />;
    } else {
      authComponent = <UserLoggedOut showErrors={ this.props.showErrors }/>;
    }

    return (
      <div className="nav-bar group">

        <figure className="nav-bar-logo">
          <a href="/#">
            <img src={ window.NomNomsApp.images.logoImage }/>
          </a>
        </figure>

        <SearchMain showErrors={ this.props.showErrors }/>

        { authComponent }

      </div>
    );
  }
});
