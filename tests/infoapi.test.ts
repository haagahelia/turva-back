import createApp from "../src/app";
import request from "supertest";
import { Express } from "express";
import { pool } from "@/config/db";

const app: Express = createApp();

describe("Info API Integration Tests", () => {
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

  describe("GET /api/info", () => {
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

  describe("GET /api/info/:id", () => {
    it("should return 200 OK for existing item", async () => {
      const res = await request(app).get(`/api/info/${testId1}`);
      expect(res.status).toBe(200);
    });

    it("should return the correct info item", async () => {
      const res = await request(app).get(`/api/info/${testId1}`);
      expect(res.body).toHaveProperty("id", testId1);
      expect(res.body).toHaveProperty("title", TEST_TITLE_1);
      expect(res.body).toHaveProperty("content", "Test Content 1");
    });

    it("should return 404 Not Found for non-existing item", async () => {
      const res = await request(app).get("/api/info/999999");
      expect(res.status).toBe(404);
    });

    it("should return 400 Bad Request for invalid id", async () => {
      const res = await request(app).get("/api/info/invalid");
      expect(res.status).toBe(400);
    });

    it("should return 400 Bad Request for negative id", async () => {
      const res = await request(app).get("/api/info/-1");
      expect(res.status).toBe(400);
    });

    it("should return JSON content type", async () => {
      const res = await request(app).get(`/api/info/${testId1}`);
      expect(res.headers["content-type"]).toMatch(/application\/json/);
    });
  });
});
