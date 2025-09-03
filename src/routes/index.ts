import { Router } from "express";

const router = Router();

router.get("/ping", (_req, res) => {
    res.send("pong")
});

router.get("/", (_req, res) => {
    res.json("Hello world!")
});

export default router;