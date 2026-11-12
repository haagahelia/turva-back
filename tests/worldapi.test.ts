import { createApp } from "./create-app";
import request from "supertest";
import { pool } from "../src/config/db";
import { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { randomUUID } from "crypto";
import { generateToken } from "../src/utils/tokenGenerator";

let app: INestApplication;

let adminToken: string;
let regularUserToken: string;
const userIds: number[] = [];
const worldIds: number[] = [];

const createUser = async (role: "admin" | "user"): Promise<string> => {
  const suffix = randomUUID();
  const username = `world-${role}-${suffix}`;
  const email = `world-${role}-${suffix}@turva.back.fi`;
  const result = await pool.query(
    `INSERT INTO TurvaUser (organization_id, profile_name, email_address, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id`,
    [1, username, email, role]
  );
  userIds.push(result.rows[0].user_id);
  return generateToken(email, username);
};

const createWorld = async (): Promise<number> => {
  const result = await pool.query(
    `INSERT INTO World (organization_id, world_name_fi, world_name_en, order_number)
     VALUES ($1, $2, $3, $4)
     RETURNING world_id`,
    [1, "TEST_WORLD_FI", "TEST_WORLD_EN", 99]
  );
  worldIds.push(result.rows[0].world_id);
  return result.rows[0].world_id;
};

const createQuiz = async (worldId: number): Promise<number> => {
  const result = await pool.query(
    `INSERT INTO Quiz (world_id, quiz_name_fi, quiz_name_en, quiz_content, order_number)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING quiz_id`,
    [worldId, "TEST_QUIZ_FI", "TEST_QUIZ_EN", JSON.stringify({}), 1]
  );
  return result.rows[0].quiz_id;
};

beforeAll(async () => {
  app = await createApp();
  adminToken = await createUser("admin");
  regularUserToken = await createUser("user");
});

afterAll(async () => {
  for (const worldId of worldIds) {
    await pool.query("DELETE FROM Quiz WHERE world_id = $1", [worldId]);
    await pool.query("DELETE FROM World WHERE world_id = $1", [worldId]);
  }
  for (const userId of userIds) {
    await pool.query("DELETE FROM TurvaUser WHERE user_id = $1", [userId]);
  }
  await app.close();
});

describe("World api integration tests", () => {
  describe("GET /api/world/:id", () => {
    it("returns an active world", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer()).get(
        `/api/world/${worldId}`
      );
      expect(res.statusCode).toBe(200);
      expect(res.body.world_id).toBe(worldId);
    });

    it("returns 400 for an invalid id", async () => {
      const res = await request(app.getHttpServer()).get("/api/world/abc");
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Invalid ID format");
    });

    it("returns 404 for an unknown id", async () => {
      const res = await request(app.getHttpServer()).get("/api/world/99999");
      expect(res.statusCode).toBe(404);
    });
  });

  describe("POST /api/world", () => {
    const newWorld = {
      organization_id: 1,
      world_name_fi: "Uusi maailma",
      world_name_en: "New World",
      order_number: 5,
    };

    it("returns 401 without a token", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/world")
        .send(newWorld);
      expect(res.statusCode).toBe(401);
    });

    it("returns 403 for a non-admin user", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/world")
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send(newWorld);
      expect(res.statusCode).toBe(403);
    });

    it("creates a world for an admin", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/world")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(newWorld);
      expect(res.statusCode).toBe(201);
      expect(res.body.world_name_en).toBe("New World");
      worldIds.push(res.body.world_id);
    });

    it("returns 400 when a field is missing", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/world")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...newWorld, world_name_fi: undefined });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("PUT /api/world/:id", () => {
    const update = {
      world_name_fi: "Päivitetty maailma",
      world_name_en: "Updated world",
      order_number: 7,
    };

    it("returns 401 without a token", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer())
        .put(`/api/world/${worldId}`)
        .send(update);
      expect(res.statusCode).toBe(401);
    });

    it("returns 403 for a non-admin user", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer())
        .put(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${regularUserToken}`)
        .send(update);
      expect(res.statusCode).toBe(403);
    });

    it("updates the names and order of a world", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer())
        .put(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(update);
      expect(res.statusCode).toBe(200);
      expect(res.body.updated.world_name_fi).toBe("Päivitetty maailma");
      expect(res.body.updated.world_name_en).toBe("Updated world");
      expect(Number(res.body.updated.order_number)).toBe(7);
    });

    it("keeps the quizzes of the world linked after an update", async () => {
      const worldId = await createWorld();
      const quizId = await createQuiz(worldId);
      await request(app.getHttpServer())
        .put(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(update);

      const quiz = await pool.query(
        "SELECT world_id FROM Quiz WHERE quiz_id = $1",
        [quizId]
      );
      expect(quiz.rows[0].world_id).toBe(worldId);
    });

    it("refuses to change organization_id", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer())
        .put(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...update, organization_id: 2 });
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("organization_id cannot be changed");

      const world = await pool.query(
        "SELECT organization_id, world_name_en FROM World WHERE world_id = $1",
        [worldId]
      );
      expect(world.rows[0].organization_id).toBe(1);
      expect(world.rows[0].world_name_en).toBe("TEST_WORLD_EN");
    });

    it("returns 400 for invalid fields", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer())
        .put(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ ...update, order_number: -1 });
      expect(res.statusCode).toBe(400);
    });

    it("returns 400 for an invalid id", async () => {
      const res = await request(app.getHttpServer())
        .put("/api/world/0")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(update);
      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Invalid ID format");
    });

    it("returns 404 for an unknown id", async () => {
      const res = await request(app.getHttpServer())
        .put("/api/world/99999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send(update);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("DELETE /api/world/:id", () => {
    it("returns 401 without a token", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer()).delete(
        `/api/world/${worldId}`
      );
      expect(res.statusCode).toBe(401);
    });

    it("returns 403 for a non-admin user", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer())
        .delete(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${regularUserToken}`);
      expect(res.statusCode).toBe(403);
    });

    it("soft deletes an empty world and hides it from GET", async () => {
      const worldId = await createWorld();
      const res = await request(app.getHttpServer())
        .delete(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Deleted successfully");

      const row = await pool.query(
        "SELECT deleted_at FROM World WHERE world_id = $1",
        [worldId]
      );
      expect(row.rows[0].deleted_at).not.toBeNull();

      const get = await request(app.getHttpServer()).get(
        `/api/world/${worldId}`
      );
      expect(get.statusCode).toBe(404);
    });

    it("returns 409 and keeps the world while it has active quizzes", async () => {
      const worldId = await createWorld();
      await createQuiz(worldId);
      await createQuiz(worldId);

      const res = await request(app.getHttpServer())
        .delete(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(409);
      expect(res.body.quiz_count).toBe(2);

      const row = await pool.query(
        "SELECT deleted_at FROM World WHERE world_id = $1",
        [worldId]
      );
      expect(row.rows[0].deleted_at).toBeNull();
    });

    it("allows the delete once its quizzes are deleted", async () => {
      const worldId = await createWorld();
      const quizId = await createQuiz(worldId);
      await request(app.getHttpServer())
        .delete(`/api/quiz/${quizId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      const res = await request(app.getHttpServer())
        .delete(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
    });

    it("returns 404 for an already deleted world", async () => {
      const worldId = await createWorld();
      await request(app.getHttpServer())
        .delete(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      const res = await request(app.getHttpServer())
        .delete(`/api/world/${worldId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(404);
    });

    it("returns 400 for an invalid id", async () => {
      const res = await request(app.getHttpServer())
        .delete("/api/world/-1")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(400);
    });
  });
});
