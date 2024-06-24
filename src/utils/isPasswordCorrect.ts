import { User } from "../db/models/user.models";
import bcrypt from "bcrypt";

export const isPasswordCorrect = async (password: string, id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }
  return await bcrypt.compare(password, user?.password);
};
