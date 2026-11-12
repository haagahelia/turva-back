import { createApp } from "./create-app";
import request from "supertest";
import { pool } from "../src/config/db";
import { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { randomUUID } from "crypto";
import { generateToken } from "../src/utils/tokenGenerator";

let app: INestApplication;
const userIds: number[] = [];

const createUser = async (role: "admin" | "user") => {
  const suffix = randomUUID();
  const username = `profile-${role}-${suffix}`;
  const email = `profile-${role}-${suffix}@turva.back.fi`;
  const result = await pool.query(
    `INSERT INTO TurvaUser (organization_id, profile_name, email_address, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id`,
    [1, username, email, role]
  );
  userIds.push(result.rows[0].user_id);
  return { username, email, token: generateToken(email, username) };
};

beforeAll(async () => {
  app = await createApp();
});

afterAll(async () => {
  for (const userId of userIds) {
    await pool.query("DELETE FROM TurvaUser WHERE user_id = $1", [userId]);
  }
  await app.close();
});

describe("GET /api/user/profile", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app.getHttpServer()).get("/api/user/profile");
    expect(res.statusCode).toBe(401);
  });

  it("returns the profile with role 'admin' for an admin", async () => {
    const admin = await createUser("admin");
    const res = await request(app.getHttpServer())
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${admin.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.profileName).toBe(admin.username);
    expect(res.body.email).toBe(admin.email);
    expect(res.body.role).toBe("admin");
  });

  it("returns role 'user' for a regular user", async () => {
    const user = await createUser("user");
    const res = await request(app.getHttpServer())
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${user.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.role).toBe("user");
  });

  it("returns 404 when the token's profile name does not match the email", async () => {
    const user = await createUser("admin");
    const token = generateToken(user.email, "someone-else");
    const res = await request(app.getHttpServer())
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
