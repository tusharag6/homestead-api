import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  profile,
} from "../controllers/user.controllers";
import { verifyJWT } from "../middlewares/auth.middlewares";
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/me").get(verifyJWT, profile);
router.route("/refresh").get(refreshToken);

export default router;
