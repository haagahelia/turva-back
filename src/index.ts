import dotenv from 'dotenv';
dotenv.config();

import createApp from "./app";
import { connectDB } from "./config/db";
import swaggerDocs from './utils/swagger';

const port: number = 3000;

const startServer = async (): Promise<void> => {
    await connectDB();

    const app = createApp();

    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        if (process.env.ENABLE_SWAGGER === "true") {
            swaggerDocs(app, port);
        }
    });
};

startServer().catch((err: unknown) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
