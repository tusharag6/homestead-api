import { UserLoginType, UserRolesEnum } from "../constants";
import { User } from "../db/models/user.models";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { Response, Request } from "express";
import { isPasswordCorrect } from "../utils/isPasswordCorrect";
import { generateAccessToken } from "../utils/generateAccessToken";
import { generateRefreshToken } from "../utils/generateRefreshToken";
import { CustomRequest } from "../interfaces/auth.interfaces";
import { generateToken } from "../utils/generateToken";

const generateTokenDB = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const token = await generateToken(user.id);
    user.token = token;
    await user.save({ validateBeforeSave: false });
    return { token };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating the token");
  }
};

const registerUser = async (req: Request, res: Response) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({ email });

  if (existedUser) {
    return res
      .status(409)
      .json(
        new ApiResponse(409, {}, "An account with this email already exists.")
      );
  }

  const user = await User.create({
    email,
    password,
    username,
    role: role || UserRolesEnum.USER,
  });

  const createdUser = await User.findById(user._id).select("-password -token ");

  return res
    .status(201)
    .json(
      new ApiResponse(200, { createdUser }, "User registered successfully")
    );
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Please provide a valid email address."));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(404)
      .json(
        new ApiResponse(
          404,
          {},
          "No account found with this email. Please register."
        )
      );
  }

  if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "You have previously registered using " +
            user.loginType.toLowerCase() +
            " . Please use the " +
            user.loginType.toLowerCase() +
            " login option to access your account."
        )
      );
  }

  const isPasswordValid = await isPasswordCorrect(password, user.id);

  if (!isPasswordValid) {
    return res
      .status(401)
      .json(new ApiResponse(401, {}, "Incorrect email or password!"));
  }

  const { token } = await generateTokenDB(user.id);

  const loggedInUser = await User.findById(user._id).select("-password -token");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("token", token, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, token },
        "User logged in successfully"
      )
    );
};

const logoutUser = async (req: CustomRequest, res: Response) => {
  await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        token: "",
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("token", options)
    .json(new ApiResponse(200, {}, "User logged out"));
};

const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  console.log("Refresh request", refreshToken);

  if (!refreshToken) {
    return res.status(401).json(new ApiError(401, "Unauthorized request"));
  }

  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!secret) {
    return res
      .status(500)
      .json(new ApiError(500, "REFRESH_TOKEN_SECRET is not defined"));
  }

  try {
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(401).json(new ApiError(401, "Invalid refresh token"));
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const accessToken = await generateAccessToken(user.id);
    console.log("Sending access token", accessToken);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    let errorMessage = "Invalid refresh token";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(401).json(new ApiError(401, errorMessage));
  }
};

export { registerUser, loginUser, logoutUser, refreshAccessToken };
