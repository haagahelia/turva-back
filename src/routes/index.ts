import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller()
export class RoutesController {
  /**
   * @openapi
   * /api/ping:
   *   get:
   *     summary: Check API availability
   *     description: Returns a plain-text response to confirm the API is running
   *     tags:
   *       - Status
   *     responses:
   *       '200':
   *         description: API is available
   */
  @Get("ping")
  ping(@Res() res: Response): void {
    res.send("pong");
  }

  /**
   * @openapi
   * /api:
   *   get:
   *     summary: Get the API greeting
   *     description: Returns a greeting from the API root
   *     tags:
   *       - Status
   *     responses:
   *       '200':
   *         description: Greeting returned successfully
   */
  @Get()
  root(@Res() res: Response): void {
    res.json("Hello world!");
  }
}
