import mongoose from "mongoose";

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    numberOfGuests: {
      type: Number,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
