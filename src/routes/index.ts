import { Router } from "express";
import authRouter from "./auth";
import infoRouter from "./info";
import quizRouter from "./quiz";

const router = Router();

router.get("/ping", (_req, res) => {
    res.send("pong")
});

router.get("/", (_req, res) => {
    res.json("Hello world!")
});

// Define actual routes
router.use("/auth", authRouter);
router.use("/info", infoRouter);
router.use("/quiz", quizRouter);

export default router;
