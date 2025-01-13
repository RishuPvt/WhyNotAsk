import { Router } from "express";
import { CreateComment , UpdateComment , DeleteComment , getAllComment , getCommentByuser} from "../Controller/Comment.controller.js"
import {verifyJWT} from "../Middleware/Auth.middleware.js"
import {upload} from "../Middleware/Multer.middleware.js"

const router= Router();

router.route("/CreateComment/:questionId").post(verifyJWT,upload.single("media"),CreateComment)
router.route("/UpdateComment/:answerId").patch(verifyJWT ,UpdateComment)
router.route("/DeleteComment/:answerId").delete(verifyJWT ,DeleteComment)
router.route("/getCommentByuser").get(verifyJWT ,getCommentByuser)
router.route("/getAllComment/:questionId").get(verifyJWT ,getAllComment)


export default router;