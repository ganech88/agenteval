import "server-only";
import { createHash, randomBytes } from "crypto";

const PREFIX = "ae_live";

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const random = randomBytes(24).toString("base64url");
  const key = `${PREFIX}_${random}`;
  return {
    key,
    prefix: key.slice(0, 14),
    hash: hashApiKey(key),
  };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
