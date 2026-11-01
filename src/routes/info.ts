import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { pool } from "../config/db";

/**
 * @openapi
 * /api/info:
 *   get:
 *     summary: Returns all info pages
 *     description: Selects all from info, orders them by id and returns json
 *     tags:
 *       - Info Page
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database query failed
 */
@Controller("info")
export class InfoController {
  @Get("/")
  async getAllInfoPages() {
    try {
      const result = await pool.query("SELECT * FROM info ORDER BY id;");
      return result.rows;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }

  /**
   * @openapi
   * /api/info/{id}:
   *   get:
   *     summary: Get info page by ID
   *     description: Selects all from info where the ID matches the provided ID
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the info to get
   *     tags:
   *       - Info Page
   *     responses:
   *       '200':
   *         description: OK
   *       '400':
   *         description: Invalid ID format
   *       '404':
   *         description: ID not found
   *       '500':
   *         description: Database query failed
   */
  @Get("/:id")
  async getInfoPageById(@Param("id") id: string) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query("SELECT * FROM info WHERE id = $1", [
        numericId,
      ]);
      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return result.rows[0];
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error in query:", err);
      throw new InternalServerErrorException({
        error: "Database query failed",
      });
    }
  }

  /**
   * @openapi
   * /api/info/{id}:
   *   delete:
   *     summary: Delete info page by ID
   *     description: Delete info page where the ID you give matches the ID of the info page you want to delete
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the info page you want to get
   *     tags:
   *       - Info Page
   *     responses:
   *       '200':
   *         description: OK
   *       '400':
   *         description: Invalid ID format
   *       '404':
   *         description: ID not found
   *       '500':
   *         description: Delete failed
   */
  @Delete("/:id")
  async deleteInfoPage(@Param("id") id: string) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query(
        "DELETE FROM info WHERE id = $1 RETURNING *",
        [numericId]
      );
      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return { message: "Deleted successfully", deleted: result.rows[0] };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Delete failed", err);
      throw new InternalServerErrorException({ error: "Delete failed" });
    }
  }

  /**
   * @openapi
   * /api/info:
   *   post:
   *     summary: Add new info to db
   *     description: Insert into info
   *     requestBody:
   *       description: title and content
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             properties:
   *               title:
   *                 type: string
   *                 example: New Page Title
   *               content:
   *                 type: string
   *                 example: New page content
   *     tags:
   *       - Info Page
   *     responses:
   *       '201':
   *         description: Created
   *       '400':
   *         description: Title or content missing
   *       '500':
   *         description: Insert failed
   */
  @Post("/")
  async createInfoPage(@Body() body: Record<string, any>) {
    try {
      const { title, content } = body;
      if (!title || !content) {
        throw new BadRequestException({
          error: "Title or content missing",
        });
      }
      const result = await pool.query(
        "INSERT INTO info (title, content) VALUES ($1, $2) RETURNING *",
        [title, content]
      );
      return result.rows[0];
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Insert failed", err);
      throw new InternalServerErrorException({ error: "Insert failed" });
    }
  }

  /**
   * @openapi
   * /api/info/{id}:
   *   put:
   *     summary: Update info
   *     description: Update info page where ID matches
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the info to update
   *     requestBody:
   *       description: title and content
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 example: New Page Title
   *               content:
   *                 type: string
   *                 example: New page content
   *     tags:
   *       - Info Page
   *     responses:
   *       '200':
   *         description: Updated successfully
   *       '400':
   *         description: Invalid ID format or missing title/content
   *       '404':
   *         description: ID not found
   *       '500':
   *         description: Update failed
   */
  @Put("/:id")
  async updateInfoPage(
    @Body() body: Record<string, any>,
    @Param("id") id: string
  ) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const { title, content } = body;
      if (!title || !content) {
        throw new BadRequestException({
          error: "Title or content missing",
        });
      }
      const result = await pool.query(
        "UPDATE info SET title = $1, content = $2, created_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
        [title, content, numericId]
      );
      if (result.rowCount === 0) {
        throw new NotFoundException({ error: "ID not found" });
      }
      return { message: "Updated successfully", updated: result.rows[0] };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Update failed:", err);
      throw new InternalServerErrorException({ error: "Update failed" });
    }
  }
}
