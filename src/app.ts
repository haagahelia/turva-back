import express, { Express } from "express";
import routes from "./routes";
import cors from 'cors';
import { corsOptions } from "./config/cors";


const createApp = (): Express => {
    const app: Express = express();

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use("/api", routes);


    return app;
};

export default createApp;
