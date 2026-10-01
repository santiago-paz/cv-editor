import { afterEach, describe, expect, it, vi } from "vitest";
import { KEEP } from "@/lib/keep";
import { purge, throttled } from "@/lib/server/retention";

/* The database module opens a pool, which a test has no use for. */
vi.mock("@/lib/server/db", () => ({ pool: { query: vi.fn() } }));

/* What `purge` asks the database to forget, and when the site runs it. The SQL
   itself needs a real Postgres to prove; these checks pin down which tables it
   touches, in what order, and with which windows. */

function recorder() {
  const calls: Array<{ sql: string; params: unknown[] | undefined }> = [];
  return {
    calls,
    db: {
      query: async (sql: string, params?: unknown[]) => {
        calls.push({ sql: sql.replace(/\s+/g, " ").trim(), params });
      },
    },
  };
}

describe("how long the server keeps things", () => {
  it("never judges an account by rewrite rows it has already deleted", () => {
    expect(KEEP.idleAccountMonths).toBeLessThanOrEqual(KEEP.rewriteMonths);
  });

  it("is a whole number of months, which is what the SQL expects", () => {
    expect(Number.isInteger(KEEP.rewriteMonths)).toBe(true);
    expect(Number.isInteger(KEEP.idleAccountMonths)).toBe(true);
  });
});

describe("purge", () => {
  it("clears expired sessions and sign-in checks, then old rewrites, then idle accounts", async () => {
    const { db, calls } = recorder();
    await purge(db);
    expect(calls.map(call => call.sql.split(" where ")[0])).toEqual([
      "delete from session",
      "delete from verification",
      "delete from ai_log",
      'delete from "user" u',
    ]);
  });

  it("passes the windows as parameters, not as text in the SQL", async () => {
    const { db, calls } = recorder();
    await purge(db);
    expect(calls[2].params).toEqual([KEEP.rewriteMonths]);
    expect(calls[3].params).toEqual([KEEP.idleAccountMonths]);
    expect(calls.every(call => !/\b12\b/.test(call.sql))).toBe(true);
  });

  it("only removes accounts that have no recent rewrite and no live session", async () => {
    const { db, calls } = recorder();
    await purge(db);
    const sql = calls[3].sql;
    expect(sql).toContain("not exists ( select 1 from ai_log");
    expect(sql).toContain("not exists (select 1 from session");
    expect(sql).toContain('u."createdAt" < now()');
  });
});

describe("throttled", () => {
  afterEach(() => vi.restoreAllMocks());

  it("starts the work once in the window, and again after it", async () => {
    let clock = 1_000_000;
    const run = vi.fn(async () => undefined);
    const go = throttled(run, 60_000, () => clock);

    go();
    go();
    clock += 59_000;
    go();
    expect(run).toHaveBeenCalledTimes(1);

    clock += 2_000;
    go();
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("logs a failure and carries on", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const go = throttled(() => Promise.reject(new Error("database is down")), 60_000, () => 0);
    expect(() => go()).not.toThrow();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(error).toHaveBeenCalledWith("Purge failed:", "database is down");
  });
});
