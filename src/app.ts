import express from "express";
import routes from "./routes";
import cors from 'cors';
import { corsOptions } from "./config/cors";


const createApp = () => {
    const app = express();

    app.use(cors(corsOptions));
    app.use(express.json());

    app.use(express.json());
    app.use("/api", routes);


    return app;
};

export default createApp;
