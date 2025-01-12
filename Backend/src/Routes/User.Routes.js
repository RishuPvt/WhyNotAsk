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
router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(verifyJWT, logoutUser);
router.route("/getCurrentUser").get(getCurrentUser);
router.route("/getUserbyId/:userId").get(getUserbyId);
router.route("/updateAccountDetails").put(verifyJWT, updateAccountDetails);
router
  .route("/updateUserAvatar")
  .put(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/changeCurrentPassword").put(verifyJWT ,changeCurrentPassword);

export default router;
