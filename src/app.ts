import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRouter from "./routes/user.routes";
import listingRouter from "./routes/listing.routes";
import bookingRouter from "./routes/booking.routes";

require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(cookieParser());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
  });
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/listings", listingRouter);
app.use("/api/v1/bookings", bookingRouter);

export default app;
