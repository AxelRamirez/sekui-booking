import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  Booking,
  Departure,
  EmailMessage,
  Inquiry,
  Payment,
  Subscriber,
} from "@/lib/booking/types";
import { createSeedDatabase, SCHEMA_VERSION } from "./seed";

/**
 * A tiny JSON-file database so the demo runs with zero infrastructure.
 * Swap `readDb`/`mutateDb` for a real database (Postgres, etc.) in production.
 */
export interface Database {
  schemaVersion: number;
  seededAt: string;
  departures: Departure[];
  bookings: Booking[];
  payments: Payment[];
  emails: EmailMessage[];
  inquiries: Inquiry[];
  subscribers: Subscriber[];
}

const DATA_DIR =
  process.env.DATA_DIR ?? (process.env.VERCEL ? "/tmp/booking-data" : path.join(process.cwd(), ".data"));
const DB_FILE = path.join(DATA_DIR, "db.json");

// Serializes access within the process; survives hot reloads in development.
const state = globalThis as unknown as { __dbQueue?: Promise<unknown> };

function withLock<T>(task: () => Promise<T>): Promise<T> {
  const run = (state.__dbQueue ?? Promise.resolve()).then(task, task);
  state.__dbQueue = run.catch(() => undefined);
  return run;
}

async function persist(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE);
}

async function load(): Promise<Database> {
  try {
    const db = JSON.parse(await fs.readFile(DB_FILE, "utf8")) as Database;
    if (db.schemaVersion === SCHEMA_VERSION) return db;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
  }
  const seeded = createSeedDatabase(new Date());
  await persist(seeded);
  return seeded;
}

export function readDb(): Promise<Database> {
  return withLock(load);
}

/** Runs `mutation` against the latest data and saves the result atomically. */
export function mutateDb<T>(mutation: (db: Database) => T | Promise<T>): Promise<T> {
  return withLock(async () => {
    const db = await load();
    const result = await mutation(db);
    await persist(db);
    return result;
  });
}

export function resetDb(): Promise<void> {
  return withLock(() => persist(createSeedDatabase(new Date())));
}
