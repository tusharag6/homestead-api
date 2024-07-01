import { Router } from "express";
import {
  getAllListings,
  getListingById,
} from "../controllers/listing.controllers";

const router = Router();

router.route("/all").get(getAllListings);
router.route("/:id").get(getListingById);

export default router;
