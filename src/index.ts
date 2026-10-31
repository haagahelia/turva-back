import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import createApp from "./app";
import { connectDB } from "./config/db";

const port: number = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  await connectDB();

  const app = await createApp();
  await app.listen(port);
  console.log(`Server running on port ${port}`);
};

startServer().catch((err: unknown) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
