import { Router } from "express";
import { getAllListings } from "../controllers/listing.controllers";

const router = Router();

router.route("/all").get(getAllListings);

export default router;
