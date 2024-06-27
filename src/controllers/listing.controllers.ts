import { Request, Response } from "express";
import { Listing } from "../db/models/listing.models";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";

const getAllListings = async (req: Request, res: Response) => {
  try {
    const listings = await Listing.find();
    if (!listings) {
      return res.status(500).json(new ApiError(409, "No listings", []));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { listings }, "Data fetching successful"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(409, "Error while fetching listings", [error]));
  }
};

export { getAllListings };
