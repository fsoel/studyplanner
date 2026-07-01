import type { UserRow } from "../utils/schema";

declare module "h3" {
  interface H3EventContext {
    user?: UserRow | null;
  }
}

export {};
