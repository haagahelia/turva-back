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
  const createdIds: number[] = [];

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
    await pool.query("DELETE FROM info WHERE id = ANY($1)", [
      [testId1, testId2, ...createdIds],
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

  describe("POST /api/info", () => {
    it("should create a new info item", async () => {
      const res = await request(app)
        .post("/api/info")
        .send({ title: "New Test Title", content: "New Test Content" });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("title", "New Test Title");
      expect(res.body).toHaveProperty("content", "New Test Content");
      createdIds.push(res.body.id);
    });

    it("should return 400 Bad Request for missing title", async () => {
      const res = await request(app)
        .post("/api/info")
        .send({ content: "Missing Title" });
      expect(res.status).toBe(400);
    });

    it("should return 400 Bad Request for missing content", async () => {
      const res = await request(app)
        .post("/api/info")
        .send({ title: "Missing Content" });
      expect(res.status).toBe(400);
    });

    it("should return 400 Bad Request for empty title", async () => {
      const res = await request(app)
        .post("/api/info")
        .send({ title: "", content: "Empty Title" });
      expect(res.status).toBe(400);
    });

    it("should return 400 Bad Request for empty content", async () => {
      const res = await request(app)
        .post("/api/info")
        .send({ title: "Empty Content", content: "" });
      expect(res.status).toBe(400);
    });

    it("should return JSON content type", async () => {
      const res = await request(app)
        .post("/api/info")
        .send({ title: "Content Type Test", content: "Testing content type" });
      expect(res.headers["content-type"]).toMatch(/application\/json/);
      createdIds.push(res.body.id);
    });

    it("should persist the created item in the database", async () => {
      const res = await request(app)
        .post("/api/info")
        .send({ title: "Persistence Test", content: "Persisted persistence" });

      createdIds.push(res.body.id);

      const getRes = await request(app).get(`/api/info/${res.body.id}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body).toHaveProperty("id", res.body.id);
      expect(getRes.body).toHaveProperty("title", "Persistence Test");
      expect(getRes.body).toHaveProperty("content", "Persisted persistence");
    });
  });
});
