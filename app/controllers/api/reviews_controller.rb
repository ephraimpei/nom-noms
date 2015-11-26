class Api::ReviewsController < ApplicationController
  def create
    @review = Review.new(review_params)

    if @review.save
      render :show
    else
      render json: @review.errors.full_messages, status: 400
    end
  end

  def index
    if !params[:locId].nil?
      @reviews = Review.where(location_id: params[:locId])
    elsif !params[:userId].nil?
      @reviews = Review.where(user_id: params[:userId])
    else
      @reviews = []
    end

    render :index
  end

  def destroy
    @review = Review.find(params[:id].to_i)

    @review.destroy

    render json: @review
  end

  private

  def review_params
    params.require(:review).permit(:user_id, :location_id, :rating, :body, tags: [])
  end
end
