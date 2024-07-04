import { Request, Response } from "express";
import { CustomRequest } from "../interfaces/auth.interfaces";
import ApiResponse from "../utils/ApiResponse";
import { Listing } from "../db/models/listing.models";
import { Booking } from "../db/models/booking.models";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../db/models/user.models";
import ApiError from "../utils/ApiError";

const reserveListing = async (req: Request, res: Response) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const { listing, numberOfGuests, numberOfDays, startDate, endDate, price } =
    req.body;
  const secret = process.env.TOKEN_SECRET;

  if (!token) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"));
  }

  if (!secret) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "TOKEN_SECRET is not defined"));
  }
  if (
    !listing &&
    !numberOfDays &&
    !numberOfGuests &&
    !startDate &&
    !endDate &&
    !price
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Please provide all the fields"));
  }

  try {
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decodedToken?._id).select(
      "-password -token"
    );

    if (!user) {
      return res.status(401).json(new ApiResponse(401, {}, "Invalid token"));
    }

    const list = await Listing.findById(listing._id);

    if (!list) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No listing found."));
    }

    const booking = new Booking({
      listing: listing._id,
      numberOfGuests,
      numberOfDays,
      startDate,
      endDate,
      price,
      user: user?.id,
    });

    await booking.save();

    return res
      .status(201)
      .json(new ApiResponse(201, booking, "Booking successfully created."));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, {}, "An error occurred."));
  }
};

const getUserBookings = async (req: Request, res: Response) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Unauthorized request"));
  }

  const secret = process.env.TOKEN_SECRET;

  if (!secret) {
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "TOKEN_SECRET is not defined"));
  }
  try {
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decodedToken?._id).select(
      "-password -token"
    );

    if (!user) {
      return res.status(401).json(new ApiResponse(401, {}, "Invalid token"));
    }

    const bookings = await Booking.find({ user: user.id }).populate("listing");
    if (!bookings.length) {
      return res
        .status(404)
        .json(new ApiResponse(404, {}, "No bookings found for this user."));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, bookings, "Bookings successfully retrieved."));
  } catch (error) {
    return res.status(500).json(new ApiResponse(500, {}, "An error occurred."));
  }
};

const getBookingById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(500)
      .json(new ApiResponse(400, {}, "Listing Id is required"));
  }

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json(new ApiError(404, "Listing not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

export { reserveListing, getUserBookings, getBookingById };
