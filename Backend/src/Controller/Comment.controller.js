import { ApiError } from "../Utlis/ApiError.js";
import { ApiResponse } from "../Utlis/ApiResponse.js";
import { asyncHandler } from "../Utlis/Asynchandler.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../Utlis/Clodinary.js";
import prisma from "../DB/DataBase.js";

const CreateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user?.id;
  const questionId = parseInt(req.params.questionId, 10);

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
  });

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  const mediaLocalPath = req.file?.path;
  let mediaUrl = null;

  if (mediaLocalPath) {
    try {
      const media = await uploadOnCloudinary(mediaLocalPath);
      mediaUrl = media?.url || null;
    } catch (error) {
      throw new ApiError(500, "Failed to upload media");
    }
  }

  const answer = await prisma.answer.create({
    data: {
      content,
      media: mediaUrl,
      ownerId: userId,
      questionId,
    },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, answer, "Comment created successfully"));
});

const UpdateComment = asyncHandler(async (req, res) => {
  const answerId = parseInt(req.params.answerId, 10);
  const userId = req.user?.id;
  const { content } = req.body;
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const answer = await prisma.answer.findUnique({
    where: {
      id: answerId,
    },
  });

  if (!answer) {
    throw new ApiError(404, "Question not found");
  }
  if (userId?.toString() !== answer.ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to Update this review");
  }
  const updateFields = {};
  if (content) updateFields.content = content;

  const updateanswer = await prisma.answer.update({
    where: {
      id: answerId,
    },
    data: updateFields,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, updateanswer, "comment updated successfully"));
});

const DeleteComment = asyncHandler(async (req, res) => {
  const answerId = parseInt(req.params.answerId, 10);
  const userId = req.user.id;

  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const answer = await prisma.answer.findUnique({
    where: {
      id: answerId,
    },
  });

  if (!answer) {
    throw new ApiError(404, "tweet not found");
  }
  if (userId?.toString() !== answer.ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this review");
  }
  const deletedAnswer = await prisma.answer.delete({
    where: {
      id: answerId,
    },
  });
  return res
    .status(200)
    .json(new ApiResponse(200, deletedAnswer, "Comment Deleted successfully"));
});

const getCommentByuser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const answers = await prisma.answer.findMany({
    where: {
      ownerId: userId,
    },
    include: {
      owner: true,
      question: true,
    },
  });

  if (answers.length === 0) {
    throw new ApiError(404, "No comments found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, answers, "Comments retrieved successfully"));
});

const getAllComment = asyncHandler(async (req, res) => {
  const questionId = parseInt(req.params.questionId, 10);

  if (!questionId) {
    throw new ApiError(400, "Question ID is required");
  }

  const comments = await prisma.answer.findMany({
    where: {
      questionId: questionId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      owner: true,
    },
  });

  if (comments.length === 0) {
    throw new ApiError(404, "No comments found for this question");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments retrieved successfully"));
});

export {
  CreateComment,
  UpdateComment,
  DeleteComment,
  getCommentByuser,
  getAllComment,
};
