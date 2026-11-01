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
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { pool } from "../config/db";

@Controller("crisis-team")
@ApiTags("Crisis Team")
export class CrisisTeamController {
  @Get("/")
  @ApiOperation({
    summary: "Returns all crisis team contacts",
    description:
      "Returns active crisis team contacts ordered by their configured order",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 500, description: "Database query failed" })
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

  @Get("/:id")
  @ApiOperation({
    summary: "Get crisis team contact by ID",
    description: "Returns the crisis team contact with the supplied ID",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Numeric ID of the contact to get",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Database query failed" })
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

  @Delete("/:id")
  @ApiOperation({
    summary: "Soft delete crisis team contact by ID",
    description: "Soft deletes the contact with the supplied ID",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Numeric ID of the contact to delete",
  })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 400, description: "Invalid ID format" })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Delete failed" })
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

  @Post("/")
  @ApiOperation({
    summary: "Add new crisis team contact to db",
    description:
      "Creates a contact and assigns order_number as the current maximum plus one",
  })
  @ApiBody({
    required: true,
    schema: {
      type: "object",
      required: [
        "organization_id",
        "name_fi",
        "name_en",
        "role_fi",
        "role_en",
        "phone",
      ],
      properties: {
        organization_id: { type: "integer", example: 1 },
        name_fi: { type: "string", example: "Teemu Kokko" },
        name_en: { type: "string", example: "Teemu Kokko" },
        role_fi: { type: "string", example: "Rehtori" },
        role_en: { type: "string", example: "Rector" },
        phone: { type: "string", example: "050 555 1131" },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Created" })
  @ApiResponse({ status: 400, description: "Missing required fields" })
  @ApiResponse({ status: 500, description: "Insert failed" })
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

  @Put("/:id")
  @ApiOperation({
    summary: "Update crisis team contact",
    description: "Updates the contact with the supplied ID",
  })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Numeric ID of the contact to update",
  })
  @ApiBody({
    required: true,
    schema: {
      type: "object",
      properties: {
        name_fi: { type: "string", example: "Jane Doe" },
        name_en: { type: "string", example: "Jane Doe" },
        role_fi: { type: "string", example: "Uusi rooli" },
        role_en: { type: "string", example: "New Role" },
        phone: { type: "string", example: "050 123 4567" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Updated successfully" })
  @ApiResponse({
    status: 400,
    description: "Invalid ID format or missing required fields",
  })
  @ApiResponse({ status: 404, description: "ID not found" })
  @ApiResponse({ status: 500, description: "Update failed" })
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
