import { ApiError } from "../Utlis/ApiError.js";
import { ApiResponse } from "../Utlis/ApiResponse.js";
import { asyncHandler } from "../Utlis/Asynchandler.js";
import { uploadOnCloudinary } from "../Utlis/Clodinary.js";
import prisma from "../DB/DataBase.js";

const createTweet = asyncHandler(async (req, res) => {
  const { title, description, tags } = req.body;

  const userId = req.user?.id;

  if (!title || !description || !tags) {
    throw new ApiError(400, "All fields are required.");
  }
  const user = await prisma.user.findUnique({
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
      tags: [tags],
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
    const questions = await prisma.question.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!questions) {
      throw new ApiError(400, {}, "All Tweet not found");
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
    include: {
      owner: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, questions, "Tweet Created Succesfully"));
});

const getAllTweetbyUser = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  console.log(userId);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  console.log(user);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const question = await prisma.question.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      owner: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, question, "Tweet Fetch Succesfully"));
});

const getTweetbyId = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      answers: true,
      owner: true,
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
  const questionId = parseInt(req.params.questionId, 10);
  const userId = req.user?.id;
  const { title, description } = req.body;
  if (!(title || description)) {
    throw new ApiError(400, "title or description is req");
  }
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });
  if (!question) {
    throw new ApiError(404, "tweet not found");
  }
  if (question.ownerId !== userId) {
    throw new ApiError(403, "You do not have permission to delete this tweet");
  }
  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

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
  const questionId = parseInt(req.params.questionId, 10);
  const userId = req.user?.id;
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    select: {
      id: true,
      ownerId: true,
    },
  });
  if (!question) {
    throw new ApiError(404, "tweet not found");
  }
  if (question.ownerId !== userId) {
    throw new ApiError(403, "You do not have permission to delete this tweet");
  }
  await prisma.question.delete({
    where: {
      id: questionId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, question, "tweet Deleted successfully"));
});

const getAllTweetByTags = asyncHandler(async (req, res) => {
  const { tag } = req.params;

  if (!tag) {
    throw new ApiError(400, "Tag is required for filtering");
  }

  const question = await prisma.question.findMany({
    where: {
      tags: {
        has: tag, // Filters Tweets that have the specified tag
      },
    },
    include: {
      owner: true,
    },
  });

  if (!question || question.length === 0) {
    throw new ApiError(404, "No tweets found with the specified tag");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, question, "Tweets fetched successfully"));
});

export {
  createTweet,
  getAllTweet,
  getTweetByUser,
  getTweetbyId,
  deleteTweet,
  UpdateTweet,
  getAllTweetByTags,
  getAllTweetbyUser,
};
