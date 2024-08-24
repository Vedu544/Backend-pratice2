import { asyncHandler } from "../db/utils/asyncHandler.js";
import { ApiError } from "../db/utils/apiError.js";
import { ApiResponse } from "../db/utils/apiResponse.js";
import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

const genrateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.genrateAcessToken();
    const refreshToken = user.genrateRefreshToken();

    user.refreshToken = refreshToken;

    await User.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError("Error generating refresh token & access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if ([email, password, username].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields must be required");
  }

  // check if the user is already registered
  const exisitingUser = await User.findOne({
    $or: [{ username, email }],
  });
  if (exisitingUser) {
    throw new ApiError("user already registered");
  }

  const user = await User.create({
    email,
    username: username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError("something went wrong when creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "user created successfully"));
});

const LoginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Email & username are required");
  }

  const user = await User.findOne({
    $or: ({ email }, { username }),
  });

  //check password
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid password");
  }

  //get access token & refresh Token
  const { accessToken, refreshToken } = await genrateAccessandRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password, refresh_token"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("acessToken", accessToken, options)
    .cookie("RefreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const Logout = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user.id,
    {
      $unset: { refreshToken: 1 },
    },
    {
      new: true,
    }
  );

  const options = {
    httpsOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", acessToken, options)
    .clearCookie("refreshToken", RefreshToken, options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const getCurrentUser = asyncHandler(
  async(req, res) => {
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "current user fetched"));
  })


const updateAccountDeatails = asyncHandler(async (req, res) => {
  const { fullName, email, oldPassword, newPassword } = req.body; // Added newPassword and oldPassword

  if (!fullName || !email) {
    throw new ApiError("400", "All fields are required");
  }

  const user = await User.findById(req.user?._id); // Fetch user for password verification

  // Check if old password is provided and verify it
  if (oldPassword && newPassword) {
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password");
    }
    user.password = newPassword; // Update password
  }

  // Saving updated user details
  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

export {
  registerUser,
  LoginUser,
  Logout,
  getCurrentUser,
  updateAccountDeatails,
};
