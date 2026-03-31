import { Router, Request, Response } from "express";
import authRouter from "./auth";
import infoRouter from "./info";
import quizRouter from "./quiz";
import worldRouter from "./world";
import crisisRouter from "./crisisTeam";

const router: Router = Router();

router.get("/ping", (_req: Request, res: Response) => {
    res.send("pong")
});

router.get("/", (_req: Request, res: Response): void => {
    res.json("Hello world!")
});

// Define actual routes
router.use("/auth", authRouter);
router.use("/info", infoRouter);
router.use("/quiz", quizRouter);
router.use("/world", worldRouter);
router.use("/crisis-team", crisisRouter);

export default router;