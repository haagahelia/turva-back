import createApp from "../src/app";
import request from "supertest";
import { Express } from "express";
import { pool } from "@/config/db";

const app: Express = createApp();

describe("GET /api/info", () => {
  const TEST_TITLE_1 = "Test Title 1";
  const TEST_TITLE_2 = "Test Title 2";

  let testId1: number;
  let testId2: number;

  beforeAll(async () => {
    const res1 = await pool.query(
      "INSERT INTO info (title, content) VALUES ($1, $2) RETURNING id",
      [TEST_TITLE_1, "Test Content 1"],
    );
    testId1 = res1.rows[0].id;

    const res2 = await pool.query(
      "INSERT INTO info (title, content) VALUES ($1, $2) RETURNING id",
      [TEST_TITLE_2, "Test Content 2"],
    );
    testId2 = res2.rows[0].id;
  });

  afterAll(async () => {
    await pool.query("DELETE FROM info WHERE id IN ($1, $2)", [
      testId1,
      testId2,
    ]);
  });

  it("should return 200 OK", async () => {
    const res = await request(app).get("/api/info");
    expect(res.status).toBe(200);
  });

  it("should return an array of info items", async () => {
    const res = await request(app).get("/api/info");
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("should contain the test info items", async () => {
    const res = await request(app).get("/api/info");
    const titles = res.body.map((item: any) => item.title);
    expect(titles).toContain(TEST_TITLE_1);
    expect(titles).toContain(TEST_TITLE_2);
  });

  it("should return items with id, title, and content fields", async () => {
    const res = await request(app).get("/api/info");
    res.body.forEach((item: any) => {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("content");
    });
  });
});
