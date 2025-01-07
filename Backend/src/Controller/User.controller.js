import { ApiError } from "../Utlis/ApiError.js";
import { ApiResponse } from "../Utlis/ApiResponse.js";
import { asyncHandler } from "../Utlis/Asynchandler.js";
import { uploadOnCloudinary } from "../Utlis/Clodinary.js";
import prisma from "../DB/DataBase.js";
import bcrypt from "bcrypt";

const RegisterUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, bio } = req.body;

  if (!username || !fullName || !email || !password) {
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

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  return res
    .status(200)
    .cookie("accessToken",options)
    .cookie("refreshToken",options)
    .json(
      new ApiResponse(200, "User logged In Successfully", {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {

  
});

export { RegisterUser, loginUser, logoutUser };
