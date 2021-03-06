var UserLoggedOut = React.createClass({
  mixins: [ReactRouter.History],

  goToSignUpPage: function (event) {
    event.preventDefault();

    this.history.pushState(null, "/users/new");
  },

  goToLoginPage: function (event) {
    event.preventDefault();

    this.history.pushState(null, "/session/new");
  },

  render: function () {
    return (
      <div className="nav-logged-out">
        <button className="nav-sign-up" onClick={this.goToSignUpPage}>
          Sign Up
        </button>

        <button onClick={this.goToLoginPage}>
          Log In
        </button>
      </div>
    );
  }
});
