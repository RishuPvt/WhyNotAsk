import { ApiError } from "../Utlis/ApiError.js";
import { ApiResponse } from "../Utlis/ApiResponse.js";
import { asyncHandler } from "../Utlis/Asynchandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../Utlis/Clodinary.js";
import prisma from "../DB/DataBase.js";

const createTweet = asyncHandler(async (req, res) => {
  const { title, description, tags } = req.body;
  const userId = req.user?.id;

  if (!title || !description || !tags) {
    throw new ApiError(400, "All fields are required.");
  }
  const user = await Prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const mediaLocalPath = req.file?.path;
  let mediaUrl = null;

  if (mediaLocalPath) {
    const media = await uploadOnCloudinary(mediaLocalPath);
    mediaUrl = media?.url || null;
  }

  const question = await prisma.question.create({
    data: {
      title,
      description,
      tags,
      media: mediaUrl,
      ownerId: userId,
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, question, "Tweet Created Succesfully"));
});

const getAllTweet = asyncHandler(async (req, res) => {
  try {
    const questions = await prisma.question.findMany();
    if (!questions) {
      throw new ApiError(400, {}, "All Product not found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, questions, "All question fetched successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, "All question fetched Unsuccessfully"));
  }
});

const getTweetByUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const questions = await prisma.question.findMany({
    where: {
      ownerId: userId,
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, questions, "Tweet Created Succesfully"));
});

const getTweetbyId = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });
  if (!question) {
    throw new ApiError(404, "tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, question, "tweet fetched successfully"));
});

const UpdateTweet = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });
  if (!question) {
    throw new ApiError(404, "tweet not found");
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (tags) updateFields.tags = tags;

  const updatedquestion = await prisma.question.update({
    where: {
      id: questionId,
    },
    data: updateFields,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedquestion,
        "tweet details updated successfully"
      )
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const question = await prisma.question.delete({
    where: {
      id: questionId,
    },
  });
  if (!question) {
    throw new ApiError(404, "tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, question, "tweet Deleted successfully"));
});

export {
  createTweet,
  getAllTweet,
  getTweetByUser,
  getTweetbyId,
  deleteTweet,
  UpdateTweet,
};
