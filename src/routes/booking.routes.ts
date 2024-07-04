import { Router } from "express";
import {
  getBookingById,
  getUserBookings,
  reserveListing,
} from "../controllers/booking.controllers";
import { verifyJWT } from "../middlewares/auth.middlewares";

const router = Router();

router.route("/reserve").post(reserveListing);
router.route("/user").get(getUserBookings);
router.route("/:id").get(getBookingById);

export default router;
