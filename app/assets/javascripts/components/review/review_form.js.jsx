var ReviewForm = React.createClass({
  mixins: [ReactPersistentState, React.addons.LinkedStateMixin, ReactRouter.History],

  getInitialState: function () {
    return (
      {
        rating: 1,
        body: "",
        images: [],
        isUploading: false,
        isSubmitting: false,
        isValid: true,
        errors: [],
        editMode: false
      }
    );
  },

  setInitialState: function () {
    this.setState(
      {
        rating: 1,
        body: "",
        images: [],
        isUploading: false,
        isSubmitting: false,
        isValid: true,
        errors: [],
        editMode: false
      }
    );
  },

  componentDidMount: function () {
    $(".review-form-body").focus();
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.review) {
      var reviewToEdit = nextProps.review;

      this.setState({
        rating: parseInt(reviewToEdit.rating),
        body: reviewToEdit.body,
        editMode: true
      });
    }
  },

  setReviewRating: function (event) {
    event.preventDefault();

    var newRating = parseInt(event.currentTarget.value);

    this.setState({rating: newRating});
  },

  changeFile: function (event) {
    event.preventDefault();

    var reader = new FileReader();
    var file = event.currentTarget.files[0];

    reader.onloadend = function() {
      var images = this.state.images.slice();
      var image = [reader.result, file];
      images.push(image);

      this.setState(
        {
          images: images,
          isUploading: false
        }
      );
    }.bind(this);

    if (file) {
      reader.readAsDataURL(file);
      this.setState({ isUploading: true });
    }
  },

  deleteFile: function (event) {
    event.preventDefault();

    var imageIdx = event.currentTarget.value;
    var images = this.state.images.slice();
    images.splice(imageIdx, 1);

    this.setState({ images: images });
  },

  submitReview: function (event) {
    event.preventDefault();

    this.setState({ isSubmitting: true });

    var formDataNoImages = new FormData();

    var rating = this.state.rating;
    var body = this.state.body;
    var userId = CurrentUserStore.currentUser().id;
    var locationId = this.props.location.id;

    var imageFiles = [];

    this.state.images.forEach(function (image) {
      imageFiles.push(image[1]);
    });

    formDataNoImages.append("review[rating]", rating);
    formDataNoImages.append("review[body]", body);
    formDataNoImages.append("review[user_id]", userId);
    formDataNoImages.append("review[location_id]", locationId);

    var failure = function (errors) {
      this.setState({
        isValid: false,
        errors: errors,
        isSubmitting: false
      });
    }.bind(this);

    var success = function (review) {
      for (var i = 0; i < imageFiles.length; i++) {
        var formDataImage = new FormData();
        formDataImage.append("image[review_id]", review.id);
        formDataImage.append("image[image_pic]", imageFiles[i]);
        formDataImage.append("image[user_id]", userId);
        ApiImageUtil.create(formDataImage);
      }

      this.setInitialState();

      if (!this.props.LocationShowPage) { this.history.goBack(); }
    }.bind(this);

    if (this.state.editMode) {
      ApiReviewUtil.update(this.props.review.id, formDataNoImages, success, failure);
    } else {
      ApiReviewUtil.create(formDataNoImages, success, failure);
    }
  },

  goBack: function (event) {
    event.preventDefault();

    if (this.props.LocationShowPage) {
      this.setInitialState();
    } else {
      this.history.goBack();
    }
  },

  render: function () {
    var errors;

    if (this.state.errors.length > 0) {
      errors = this.state.errors.map(function (error, idx) {
        return <label key={idx} className="review-form-error-msg">{error}</label>;
      });
    }

    var submitButton = this.state.isSubmitting === true ?
      <button className="submit-review-button disabled" disabled>Submit Review</button> :
      <button className="submit-review-button">Submit Review</button>;

    var uploadedPics = this.state.images.map(function (image, idx) {
      var imageUrl = image[0];
      var file = image[1];

      return (
        <div key={idx} className="review-form-uploaded-pic">
          <button
            className="delete-uploaded-pic-button"
            onClick={this.deleteFile}
            value={idx}
            >X</button>
          <img className="review-form-pic-preview" src={imageUrl} />
        </div>
      );
    }.bind(this));

    return (
      <form onSubmit={this.submitReview} className={"review-form "} >

        <div className="review-form-errors-wrapper group">
          { errors }
        </div>

        <div className="review-form-header group">
          <ReviewRatingBar
            setReviewRating={this.setReviewRating}
            currentRating={this.state.rating}
            />

          <input
            className="review-form-pic-input"
            type="file"
            onChange={this.changeFile} />
        </div>

        <div className="review-form-content">
          <textarea
            className="review-form-body"
            placeholder="Write your review here"
            valueLink={this.linkState("body")}>
          </textarea>

          <div className="review-form-pics-preview group" >
            { uploadedPics }
          </div>
        </div>

        { submitButton }

        <button
          className="review-form-cancel-button"
          onClick={this.goBack}>
          Cancel
        </button>
      </form>
    );
  }
});
