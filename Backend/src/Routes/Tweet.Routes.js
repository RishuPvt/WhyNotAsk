import { Router } from "express";
import {
  getTweetByUser,
  getAllTweet,
  deleteTweet,
  UpdateTweet,
  getTweetbyId,
  createTweet,
  getAllTweetByTags,
} from "../Controller/Tweet.controller.js";
import { verifyJWT } from "../Middleware/Auth.middleware.js";
import { upload } from "../Middleware/Multer.middleware.js";

const router = Router();

router.route("/getTweetByUser").get(verifyJWT, getTweetByUser);
router.route("/getAllTweet").get(getAllTweet);
router.route("/deleteTweet/:questionId").delete(verifyJWT, deleteTweet);
router.route("/UpdateTweet/:questionId").patch(verifyJWT, UpdateTweet);
router.route("/getTweetbyId/:questionId").get(verifyJWT, getTweetbyId);
router
  .route("/createTweet")
  .post(verifyJWT, upload.single("media"), createTweet);
router.route("/getAllTweetByTags/:tag").get(verifyJWT, getAllTweetByTags);
export default router;
