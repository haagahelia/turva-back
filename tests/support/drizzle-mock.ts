import { jest } from "@jest/globals";

const chainMethods = [
  "from",
  "where",
  "orderBy",
  "limit",
  "innerJoin",
  "leftJoin",
  "values",
  "set",
  "onConflictDoUpdate",
  "onConflictDoNothing",
  "returning",
] as const;

const queryBuilder = (result: unknown) => {
  const builder: Record<string, unknown> = {};
  for (const method of chainMethods) {
    builder[method] = jest.fn(() => builder);
  }
  builder.then = (
    onFulfilled?: (value: unknown) => unknown,
    onRejected?: (reason: unknown) => unknown
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return builder;
};

export const createDrizzleMock = () => {
  const results: unknown[] = [];
  const nextBuilder = () => queryBuilder(results.shift() ?? []);
  const db = {
    select: jest.fn(nextBuilder),
    insert: jest.fn(nextBuilder),
    update: jest.fn(nextBuilder),
    delete: jest.fn(nextBuilder),
  };

  return {
    database: { db },
    db,
    enqueueResults: (...values: unknown[]) => results.push(...values),
  };
};
