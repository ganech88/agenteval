import "server-only";
import { getDb, type Database } from "@agenteval/db";

export const db = new Proxy({} as Database, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
