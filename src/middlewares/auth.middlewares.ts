import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../db/models/user.models";
import { CustomRequest } from "../interfaces/auth.interfaces";
import ApiResponse from "../utils/ApiResponse";

const verifyJWT = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

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
    req.user = user;
    next();
  } catch (error) {
    let errorMessage = "Invalid token";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log(error);

    return res.status(401).json(new ApiResponse(401, {}, errorMessage));
  }
};

export { verifyJWT };
