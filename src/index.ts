import app from "./app";
import connectDB from "./db";

const port = process.env.PORT || 5000;
(async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      /* eslint-disable no-console */
      console.log(`⚙️  Server is running on: http://localhost:${port}\n`);
      /* eslint-enable no-console */
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
})();
