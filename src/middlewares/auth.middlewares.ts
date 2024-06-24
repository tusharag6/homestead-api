import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../db/models/user.models";
import { CustomRequest } from "../interfaces/auth.interfaces";

const verifyJWT = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    return res
      .status(500)
      .json(new ApiError(500, "ACCESS_TOKEN_SECRET is not defined"));
  }

  try {
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
  } catch (error) {
    let errorMessage = "Invalid access token";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    throw new ApiError(401, errorMessage);
  }
};

export { verifyJWT };
