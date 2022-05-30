import type { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, test } from "vitest";
import { logger } from "~/services/logger.server";
import { createDatabaseClient } from "~/test/helpers/db";
import countUsers from "./count-users";

let db: PrismaClient;

beforeAll(async () => {
  db = await createDatabaseClient();
  await db.$connect();
});

afterAll(async () => {
  await db.$disconnect();
});

describe("Count users", () => {
  test("should return the amount of users", async () => {
    let result = await countUsers({ db, logger });
    if (countUsers.isFailure(result)) throw result.error;
    expect(result.value).toBe(1);
  });
});
