import { UserLoginType, UserRolesEnum } from "../constants";
import { User } from "../db/models/user.models";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { Response, Request } from "express";
import { isPasswordCorrect } from "../utils/isPasswordCorrect";
import { generateAccessToken } from "../utils/generateAccessToken";
import { generateRefreshToken } from "../utils/generateRefreshToken";
import { CustomRequest } from "../interfaces/auth.interfaces";

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access token"
    );
  }
};

const registerUser = async (req: Request, res: Response) => {
  const { email, username, password, role } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }

  const user = await User.create({
    email,
    password,
    username,
    role: role || UserRolesEnum.USER,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully"
      )
    );
};

const loginUser = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
    throw new ApiError(
      400,
      "You have previously registered using " +
        user.loginType.toLowerCase() +
        " . Please use the " +
        user.loginType.toLowerCase() +
        " login option to access your account."
    );
  }

  const isPasswordValid = await isPasswordCorrect(password, user.id);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
};

const logoutUser = async (req: CustomRequest, res: Response) => {
  await User.findByIdAndUpdate(
    req.user?.id,
    {
      $set: {
        refreshToken: "",
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
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
};

const refreshAccessToken = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

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

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user.id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
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
