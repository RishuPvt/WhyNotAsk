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
const router = Router();

router.route("/RegisterUser").post(RegisterUser);
router.route("/loginUser").post(loginUser);
router.route("/logoutUser").post(logoutUser);
router.route("/getCurrentUser").get(getCurrentUser);
router.route("/getUserbyId/:userId").get(getUserbyId);
router.route("/updateAccountDetails").put(updateAccountDetails);
router.route("/updateUserAvatar").put(updateUserAvatar);
router.route("/changeCurrentPassword").put(changeCurrentPassword);

export default router;
