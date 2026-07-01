import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "./schema";
import { serverConfig } from "./config";

let _db: LibSQLDatabase<typeof schema> | undefined;

/**
 * Lazily-created singleton drizzle instance backed by libSQL/SQLite.
 * For local `file:` databases, ensures the parent directory exists.
 */
export function useDb(): LibSQLDatabase<typeof schema> {
  if (_db) return _db;

  const url = serverConfig().databaseUrl;

  if (url.startsWith("file:")) {
    const path = url.slice("file:".length);
    const dir = dirname(path);
    if (dir && dir !== ".") {
      mkdirSync(dir, { recursive: true });
    }
  }

  const client = createClient({ url });
  _db = drizzle(client, { schema });
  return _db;
}

export { schema };
