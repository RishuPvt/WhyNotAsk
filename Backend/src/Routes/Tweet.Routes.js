import { Router } from "express";
import {
  getTweetByUser,
  getAllTweet,
  deleteTweet,
  UpdateTweet,
  getTweetbyId,
  createTweet,
} from "../Controller/Tweet.controller.js";
import { verifyJWT } from "../Middleware/Auth.middleware.js";
import { upload } from "../Middleware/Multer.middleware.js";

const router = Router();

router.route("/getTweetByUser").post(verifyJWT, getTweetByUser);
router.route("/getAllTweet").get(getAllTweet);
router.route("/deleteTweet/:questionId").delete(verifyJWT, deleteTweet);
router.route("/UpdateTweet/:questionId").patch(verifyJWT, UpdateTweet);
router.route("/getTweetbyId/:questionId").get(verifyJWT, getTweetbyId);
router
  .route("/createTweet")
  .post(verifyJWT, upload.single("media"), createTweet);

export default router;
