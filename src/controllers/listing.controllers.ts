import { Request, Response } from "express";
import { Listing } from "../db/models/listing.models";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";

interface Data {
  next?: {
    page: number;
    limit: number;
  };
  previous?: {
    page: number;
    limit: number;
  };
  listings?: any[];
}

const getAllListings = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const data: Data = {};

  try {
    const totalListings = await Listing.countDocuments();

    if (endIndex < totalListings) {
      data.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      data.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    data.listings = await Listing.find().limit(limit).skip(startIndex);

    if (!data.listings || data.listings.length === 0) {
      return res.status(409).json(new ApiError(409, "No listings", []));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, data, "Data fetching successful"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Error while fetching listings", [error]));
  }
};

const getListingById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res
      .status(500)
      .json(new ApiResponse(400, {}, "Listing Id is required"));
  }

  try {
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json(new ApiError(404, "Listing not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, listing, "Listing fetched."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

export { getAllListings, getListingById };
