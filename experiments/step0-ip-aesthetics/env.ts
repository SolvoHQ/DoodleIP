import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadEnv(): Record<string, string> {
  const path = resolve(__dirname, ".env.experiment");
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    throw new Error(
      `Missing ${path}. Copy .env.experiment.example and fill in keys.`
    );
  }

  const env: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key) env[key] = value;
  }
  return env;
}

export function requireKey(env: Record<string, string>, name: string): string {
  const v = env[name];
  if (!v) throw new Error(`Missing ${name} in .env.experiment`);
  return v;
}
