import { readFile } from "node:fs/promises";
import { config } from "../config.js";

// Loads and lightly validates the profile document. Kept async so a future
// implementation can swap the flat file for a database or CMS without changing
// call sites.
export async function loadProfile() {
  const raw = await readFile(new URL(`../../${config.profilePath}`, import.meta.url), "utf8");
  const profile = JSON.parse(raw);

  for (const key of ["fullName", "email"]) {
    if (!(key in profile)) {
      throw new Error(`profile.json is missing required field: ${key}`);
    }
  }
  profile.roles = Array.isArray(profile.roles) ? profile.roles : [];
  profile.links = Array.isArray(profile.links) ? profile.links : [];
  return profile;
}
