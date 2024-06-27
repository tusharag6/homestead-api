import mongoose, { Schema } from "mongoose";

const listingSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    country: {
      type: String,
    },
    house_rules: {
      type: String,
    },
    listing_image_url: {
      type: String,
      required: true,
    },
    amenities: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    review_scores_rating: {
      type: Number,
      min: 0,
      default: 0,
    },
    number_of_reviews: {
      type: Number,
      min: 0,
      default: 0,
    },
    room_type: {
      type: String,
      required: true,
    },
    property_type: {
      type: String,
      required: true,
    },
    accommodates: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Listing = mongoose.model("Listing", listingSchema);
