var NewUserPage = React.createClass({
  mixins: [React.addons.LinkedStateMixin, ReactRouter.History],

  getInitialState: function () {
    return (
      {
        username: "",
        firstname: "",
        lastname: "",
        imageUrl: null,
        imageFile: "",
        password: "",
        isValid: true,
        isSubmitting: false,
        errors: []
      }
    );
  },

  componentWillMount: function () {
    if (CurrentUserStore.isLoggedIn()) {
      this.history.pushState(null, "/");
    }
  },

  handleNewUserSubmit: function (event) {
    event.preventDefault();

    this.setState({ isSubmitting: true });

    var formData = new FormData();

    formData.append("user[username]", this.state.username);
    formData.append("user[firstname]", this.state.firstname);
    formData.append("user[lastname]", this.state.lastname);
    formData.append("user[password]", this.state.password);
    formData.append("user[profile_pic]", this.state.imageFile);

    var success = function () {
      if (!loggedInTutorial) {
        NavLoggedInTutorial.start();
        loggedInTutorial = true;
      }

      this.history.goBack();
    }.bind(this);

    var failure = function (errors) {
      this.setState({
        isValid: false,
        errors: errors,
        isSubmitting: false
      });
    }.bind(this);

    ApiUserUtil.create(formData, success, failure);
  },

  changeFile: function (event) {
    var reader = new FileReader();
    var file = event.currentTarget.files[0];

    reader.onloadend = function() {
      this.setState({ imageUrl: reader.result, imageFile: file });
    }.bind(this);

    if (file) {
      reader.readAsDataURL(file);
    } else {
      this.setState({ imageUrl: "", imageFile: null });
    }
  },

  render: function () {

    var errors = this.state.errors.length > 0 ?
      this.state.errors.map(function (error, idx) {
        return <li key={idx} className="user-error-msg">{error}</li>;
      }) : "";

    var submitButton = this.state.isSubmitting ?
      <button className="submit" disabled>Submit</button> :
      <button className="submit">Submit</button>;

    return (
      <div className="auth-page">
        <h1>Create a new user</h1>

        <ul className="new-user-errors-wrapper">
          { errors }
        </ul>

        <form className="auth-page-form" onSubmit={this.handleNewUserSubmit}>
          <div className="auth-page-input-wrapper">
            <label>Username
            <input
              className="auth-page-username"
              type="text"
              valueLink={this.linkState("username")} />
            </label>

            <label>First Name
            <input
              className="auth-page-firstname"
              type="text"
              valueLink={this.linkState("firstname")} />
            </label>

            <label>Last Name
            <input
              className="auth-page-lastname"
              type="text"
              valueLink={this.linkState("lastname")} />
            </label>

            <label>Upload a profile pic
            <input
              className="auth-page-profile-pic-input"
              type="file"
              onChange={this.changeFile} />
            </label>

            <img className="auth-page-profile-pic-preview" src={this.state.imageUrl} />

            <label>Password
            <input
              className="auth-page-password"
              type="password"
              valueLink={this.linkState("password")} />
            </label>

            { submitButton }
          </div>
        </form>
      </div>
    );
  }
});
