import { Router } from "express";
import {
  RegisterUser,
  updateAccountDetails,
  getCurrentUser,
  getUserbyId,
  updateUserAvatar,
  changeCurrentPassword,
  loginUser,
  logoutUser,
} from "../Controller/User.controller.js";
import { verifyJWT } from "../Middleware/Auth.middleware.js";
import { upload } from "../Middleware/Multer.middleware.js";
const router = Router();

router.route("/RegisterUser").post(upload.single("avatar"), RegisterUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);
router.route("/getUserbyId/:userId").get(verifyJWT, getUserbyId);
router.route("/updateAccountDetails").patch(verifyJWT, updateAccountDetails);
router
  .route("/updateUserAvatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/changeCurrentPassword").post(verifyJWT, changeCurrentPassword);

export default router;
