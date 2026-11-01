import { Controller, Get, Header } from "@nestjs/common";

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
  ping(): string {
    return "pong";
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
  @Header("Content-Type", "application/json")
  root(): string {
    return JSON.stringify("Hello world!");
  }
}
