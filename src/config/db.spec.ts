import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { connectDB, pool } from "./db";

describe("connectDB", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("connects and releases the database client", async () => {
    const release = jest.fn();
    jest.spyOn(pool, "connect").mockResolvedValue({ release } as never);
    jest.spyOn(console, "log").mockImplementation(() => {});

    await expect(connectDB()).resolves.toBeUndefined();
    expect(release).toHaveBeenCalled();
  });

  it("logs a database connection failure", async () => {
    jest
      .spyOn(pool, "connect")
      .mockRejectedValue(new Error("offline") as never);
    jest.spyOn(console, "error").mockImplementation(() => {});

    await expect(connectDB()).resolves.toBeUndefined();
  });
});
