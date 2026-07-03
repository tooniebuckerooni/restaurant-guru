import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { seedIfEmpty } from "./seed";

/**
 * SQLite for development. The data layer (db/repo.ts) is the only module
 * that touches SQL, so swapping in Postgres later is contained.
 */

const DATA_DIR = path.join(process.cwd(), "data");

declare global {
  // Reuse one connection across Next.js dev hot reloads.
  var __appDb: Database.Database | undefined;
}

function open(): Database.Database {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "app.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  seedIfEmpty(db);
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orgs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      cadence TEXT NOT NULL DEFAULT 'weekly',
      min_rest_hours REAL NOT NULL DEFAULT 10,
      allow_clopens INTEGER NOT NULL DEFAULT 0,
      budget_cents INTEGER
    );
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES orgs(id),
      name TEXT NOT NULL,
      color_key TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES orgs(id),
      name TEXT NOT NULL,
      role_ids TEXT NOT NULL,          -- JSON string[]
      wage_cents INTEGER NOT NULL,
      max_hours_per_week REAL NOT NULL,
      target_hours_per_week REAL NOT NULL,
      availability TEXT NOT NULL,      -- JSON Partial<Record<Weekday, TimeRange[]>>
      time_off TEXT NOT NULL,          -- JSON string[] of ISO dates
      active INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS demand_template (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES orgs(id),
      weekday INTEGER NOT NULL,        -- 0 = Monday
      role_id TEXT NOT NULL REFERENCES roles(id),
      start_min INTEGER NOT NULL,
      end_min INTEGER NOT NULL,
      count INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL REFERENCES orgs(id),
      start_date TEXT NOT NULL,        -- ISO date
      days INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',  -- draft | published
      generated_ms REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (org_id, start_date)
    );
    CREATE TABLE IF NOT EXISTS slots (
      id TEXT PRIMARY KEY,
      schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
      requirement_id TEXT NOT NULL,
      date TEXT NOT NULL,
      role_id TEXT NOT NULL,
      start_min INTEGER NOT NULL,
      end_min INTEGER NOT NULL,
      staff_id TEXT                    -- NULL = open shift
    );
    CREATE INDEX IF NOT EXISTS idx_slots_schedule ON slots(schedule_id);
  `);
}

export function getDb(): Database.Database {
  if (!globalThis.__appDb) {
    globalThis.__appDb = open();
  }
  return globalThis.__appDb;
}
