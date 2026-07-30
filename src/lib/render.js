import { readFile } from "node:fs/promises";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Renders the card template. This is intentionally a minimal server-side
// renderer (no template engine dependency). Kirk can replace this with
// EJS/Handlebars/React SSR without touching the routes.
export async function renderCard(profile) {
  const tpl = await readFile(new URL("../views/card.html", import.meta.url), "utf8");

  const roles = profile.roles
    .map((r) => `<p class="role">${escapeHtml(r)}</p>`)
    .join("\n      ");

  const featured = profile.featured?.url
    ? `<p class="featured"><a href="${escapeHtml(profile.featured.url)}" target="_blank" rel="noopener">${escapeHtml(profile.featured.label)} &rarr;</a></p>`
    : "";

  const links = profile.links
    .filter((l) => l.url)
    .map(
      (l) =>
        `<li><a href="${escapeHtml(l.url)}" target="_blank" rel="noopener"><span class="label">${escapeHtml(
          l.label
        )}</span></a></li>`
    )
    .join("\n        ");

  const location = [profile.location?.city, profile.location?.country]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" &middot; ");

  return tpl
    .replaceAll("{{TITLE}}", escapeHtml(profile.fullName))
    .replaceAll("{{FULL_NAME}}", escapeHtml(profile.fullName))
    .replaceAll("{{ROLES}}", roles)
    .replaceAll("{{ORG_NAME}}", escapeHtml(profile.organization?.name || ""))
    .replaceAll("{{ORG_URL}}", escapeHtml(profile.organization?.url || "#"))
    .replaceAll("{{FEATURED}}", featured)
    .replaceAll("{{PHONE}}", escapeHtml(profile.phone || ""))
    .replaceAll("{{EMAIL}}", escapeHtml(profile.email || ""))
    .replaceAll("{{LINKS}}", links)
    .replaceAll("{{LOCATION}}", location);
}
