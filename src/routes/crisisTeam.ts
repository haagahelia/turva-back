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
 * /api/crisis-team:
 *   get:
 *     summary: Returns all crisis team contacts
 *     description: Selects all from CrisisTeam, orders them by order_number and returns json
 *     tags:
 *       - Crisis Team
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Database query failed
 */
@Controller("crisis-team")
export class CrisisTeamController {
  @Get("/")
  async getAllCrisisTeamContacts() {
    try {
      const result = await pool.query(
        "SELECT * FROM CrisisTeam WHERE deleted_at IS NULL ORDER BY order_number;"
      );
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
   * /api/crisis-team/{id}:
   *   get:
   *     summary: Get crisis team contact by ID
   *     description: Selects all from CrisisTeam where the ID matches the provided ID
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the contact to get
   *     tags:
   *       - Crisis Team
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
  async getCrisisTeamContactById(@Param("id") id: string) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query(
        "SELECT * FROM CrisisTeam WHERE contact_id = $1 AND deleted_at IS NULL",
        [numericId]
      );
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
   * /api/crisis-team/{id}:
   *   delete:
   *     summary: Soft delete crisis team contact by ID
   *     description: Soft delete contact where the ID you give matches the ID of the contact you want to delete
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the contact you want to delete
   *     tags:
   *       - Crisis Team
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
  async deleteCrisisTeamContact(@Param("id") id: string) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const result = await pool.query(
        "UPDATE CrisisTeam SET deleted_at = CURRENT_TIMESTAMP WHERE contact_id = $1 AND deleted_at IS NULL RETURNING *",
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
   * /api/crisis-team:
   *   post:
   *     summary: Add new crisis team contact to db
   *     description: Insert into CrisisTeam. order_number is assigned automatically as MAX + 1
   *     requestBody:
   *       description: organization_id, name_fi, name_en, role_fi, role_en, phone
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - organization_id
   *               - name_fi
   *               - name_en
   *               - role_fi
   *               - role_en
   *               - phone
   *             properties:
   *               organization_id:
   *                 type: integer
   *                 example: 1
   *               name_fi:
   *                 type: string
   *                 example: "Teemu Kokko"
   *               name_en:
   *                 type: string
   *                 example: "Teemu Kokko"
   *               role_fi:
   *                 type: string
   *                 example: "Rehtori"
   *               role_en:
   *                 type: string
   *                 example: "Rector"
   *               phone:
   *                 type: string
   *                 example: "050 555 1131"
   *     tags:
   *       - Crisis Team
   *     responses:
   *       '201':
   *         description: Created
   *       '400':
   *         description: Missing required fields
   *       '500':
   *         description: Insert failed
   */
  @Post("/")
  async createCrisisTeamContact(@Body() body: Record<string, any>) {
    try {
      const { organization_id, name_fi, name_en, role_fi, role_en, phone } =
        body;
      if (
        !organization_id ||
        !name_fi ||
        !name_en ||
        !role_fi ||
        !role_en ||
        !phone
      ) {
        throw new BadRequestException({
          error:
            "organization_id, name_fi, name_en, role_fi, role_en, and phone are required",
        });
      }
      const result = await pool.query(
        `INSERT INTO CrisisTeam (organization_id, name_fi, name_en, role_fi, role_en, phone, order_number) 
             VALUES ($1, $2, $3, $4, $5, $6, (SELECT COALESCE(MAX(order_number), 0) + 1 FROM CrisisTeam)) 
             RETURNING *`,
        [organization_id, name_fi, name_en, role_fi, role_en, phone]
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
   * /api/crisis-team/{id}:
   *   put:
   *     summary: Update crisis team contact
   *     description: Update contact where ID matches
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: Numeric ID of the contact to update
   *     requestBody:
   *       description: name_fi, name_en, role_fi, role_en, phone, order_number
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name_fi:
   *                 type: string
   *                 example: "Jane Doe"
   *               name_en:
   *                 type: string
   *                 example: "Jane Doe"
   *               role_fi:
   *                 type: string
   *                 example: "Uusi rooli"
   *               role_en:
   *                 type: string
   *                 example: "New Role"
   *               phone:
   *                 type: string
   *                 example: "050 123 4567"
   *     tags:
   *       - Crisis Team
   *     responses:
   *       '200':
   *         description: Updated successfully
   *       '400':
   *         description: Invalid ID format or missing required fields
   *       '404':
   *         description: ID not found
   *       '500':
   *         description: Update failed
   */
  @Put("/:id")
  async updateCrisisTeamContact(
    @Param("id") id: string,
    @Body() body: Record<string, any>
  ) {
    try {
      const numericId = Number(id);

      if (!Number.isInteger(numericId) || numericId <= 0) {
        throw new BadRequestException({ error: "Invalid ID format" });
      }

      const { name_fi, name_en, role_fi, role_en, phone } = body;
      if (!name_fi || !name_en || !role_fi || !role_en || !phone) {
        throw new BadRequestException({
          error: "name_fi, name_en, role_fi, role_en, and phone are required",
        });
      }
      const result = await pool.query(
        "UPDATE CrisisTeam SET name_fi = $1, name_en = $2, role_fi = $3, role_en = $4, phone = $5 WHERE contact_id = $6 AND deleted_at IS NULL RETURNING *",
        [name_fi, name_en, role_fi, role_en, phone, numericId]
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
