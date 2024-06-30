import jwt from "jsonwebtoken";
import { User } from "../db/models/user.models";

export const generateToken = async (id: string) => {
  const user = await User.findById(id);

  const secret = process.env.TOKEN_SECRET;
  const expiry = process.env.TOKEN_EXPIRY;

  if (!secret) {
    throw new Error("TOKEN_SECRET is not defined");
  }

  if (!expiry) {
    throw new Error("TOKEN_EXPIRY is not defined");
  }
  return jwt.sign(
    {
      _id: user?._id,
    },
    secret,
    { expiresIn: expiry }
  );
};
