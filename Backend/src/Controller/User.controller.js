import { ApiError } from "../Utlis/ApiError.js";
import { ApiResponse } from "../Utlis/ApiResponse.js";
import { asyncHandler } from "../Utlis/Asynchandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../Utlis/Clodinary.js";
import prisma from "../DB/DataBase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const RegisterUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, bio } = req.body;

  if (!username || !fullName || !email || !password || !bio) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (existedUser) {
    throw new ApiError(409, "User with Email. already exists");
  }

  const avatarLocalPath = req.file?.path;
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      fullName,
      email,
      password: hashedPassword,
      bio,
      avatar: avatar?.url || null,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Register Succesfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(404, "email & password is Required");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user password");
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(200, "User logged In Successfully", {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: null,
      },
    });

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(
        new ApiResponse(200, "User logged out successfully", {
          id: user.id,
          email: user.email,
        })
      );
  } catch (error) {
    throw new ApiError(500, "Error while logging out user");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new ApiError(404, "user not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "user fetched succesfully"));
  } catch (error) {
    return res
      .status(400)
      .json(new ApiError(400, "somthing went wrong while fetching user"));
  }
});

const getUserbyId = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId, 10); //The second argument 10 specifies the base (decimal).

  if (isNaN(userId)) {
    throw new ApiError(400, "Invalid user ID format");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const avatarUrl = user.avatar ? user.avatar : null;

  return res.status(200).json(
    new ApiResponse(200, {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      bio: user.bio,
      avatar: avatarUrl || null,
    }, "User fetched Successfully")
  );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Wrong user password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "password updated succesfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email, bio } = req.body;

  const userId = req.user?.id;

  if (!(username || email || bio)) {
    throw new ApiError(400, "At least one field is required");
  }
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const updateFields = {};
  if (username) updateFields.username = username;
  if (email) updateFields.email = email;
  if (bio) updateFields.bio = bio;

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateFields,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  const userId = req.user?.id;
  try {
    if (!avatarLocalPath) {
      throw new ApiError(400, "avatar file is missing");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new ApiError(404, "user not found");
    }
    if (user.avatar) {
      const publicId = user.avatar.split("/").pop().split(".")[0];
      await deleteOnCloudinary(publicId);
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
      throw new ApiError(400, "Error while uploading avatar");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar: avatar.url,
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
  } catch (error) {
    throw new ApiError(400, "somthing went wrong while changing avatar");
  }
});

export {
  RegisterUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  getUserbyId,
};
