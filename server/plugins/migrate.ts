import { migrate } from "drizzle-orm/libsql/migrator";
import { useDb } from "../utils/db";

// Apply pending database migrations on server startup.
export default defineNitroPlugin(async () => {
  try {
    await migrate(useDb(), { migrationsFolder: "drizzle" });
  } catch (err) {
    console.error("[migrate] failed to apply migrations:", err);
  }
});
