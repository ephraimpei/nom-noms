window.ApiSessionUtil = {
  login: function (credentials, success, failure) {
    $.ajax({
      url: '/api/session',
      type: 'POST',
      dataType: 'json',
      contentType: "application/json",
      data: JSON.stringify({ user: credentials }),
      success: function (currentUser) {
        CurrentUserActions.receiveCurrentUser(currentUser);
        success();
      },
      error: function (data) {
        failure(JSON.parse(data.responseText));
      }
    });
  },

  logout: function (success) {
    $.ajax({
      url: '/api/session',
      type: 'DELETE',
      dataType: 'json',
      success: function () {
        CurrentUserActions.receiveCurrentUser({});
        success && success();
      }
    });
  },

  fetchCurrentUser: function () {
    $.ajax({
      url: '/api/session',
      type: 'GET',
      dataType: 'json',
      success: function (currentUser) {
        CurrentUserActions.receiveCurrentUser(currentUser);
      }
    });
  }
};
