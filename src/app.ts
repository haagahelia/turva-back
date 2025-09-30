import express from "express";
import routes from "./routes";

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use("/api", routes);


    return app;
};

export default createApp;
