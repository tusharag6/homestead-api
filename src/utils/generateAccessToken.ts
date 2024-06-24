import jwt from "jsonwebtoken";
import { User } from "../db/models/user.models";

export const generateAccessToken = async (id: string) => {
  const user = await User.findById(id);
  const secret = process.env.ACCESS_TOKEN_SECRET;
  const expiry = process.env.ACCESS_TOKEN_EXPIRY;

  if (!secret) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined");
  }

  if (!expiry) {
    throw new Error("ACCESS_TOKEN_EXPIRY is not defined");
  }

  return jwt.sign(
    {
      _id: user?._id,
      email: user?.email,
      username: user?.username,
      role: user?.role,
    },
    secret,
    { expiresIn: expiry }
  );
};
