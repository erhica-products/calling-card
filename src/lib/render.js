import { readFile } from "node:fs/promises";
import { icon } from "./icons.js";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Every link with a URL gets an icon. The org website is included: as a globe
// glyph it reads as part of the row rather than repeating the organization line.
function visibleLinks(profile) {
  return (profile.links || []).filter((l) => l.url);
}

// "https://www.facebook.com/name/" -> "facebook.com/name"
function prettyUrl(url = "") {
  return String(url).replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

function iconLink(type, title, href) {
  // The glyph carries no text, so the accessible name and the tooltip both
  // come from `title` — that is where the address or number now lives.
  const external = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : "";
  return `<li><a href="${escapeHtml(href)}"${external} aria-label="${escapeHtml(
    title
  )}" title="${escapeHtml(title)}">${icon(type)}</a></li>`;
}

// Renders the card template. Intentionally a minimal server-side renderer
// (no template engine dependency). Every block is optional: a field left empty
// in profile.json drops out of the markup rather than rendering an empty row.
export async function renderCard(profile) {
  const tpl = await readFile(new URL("../views/card.html", import.meta.url), "utf8");

  const location = [profile.location?.city, profile.location?.country]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" &middot; ");

  const eyebrow = location ? `<p class="eyebrow">${location}</p>` : "";

  const roles = profile.roles?.filter(Boolean).length
    ? `<div class="roles">${profile.roles
        .filter(Boolean)
        .map((r) => `<p class="role">${escapeHtml(r)}</p>`)
        .join("")}</div>`
    : "";

  const orgName = profile.organization?.name || "";
  const orgUrl = profile.organization?.url || "";
  let org = "";
  if (orgName) {
    org = orgUrl
      ? `<p class="org"><a href="${escapeHtml(
          orgUrl
        )}" target="_blank" rel="noopener">${escapeHtml(orgName)}</a></p>`
      : `<p class="org">${escapeHtml(orgName)}</p>`;
  }

  const featured = profile.featured?.url
    ? `<p class="featured"><a href="${escapeHtml(
        profile.featured.url
      )}" target="_blank" rel="noopener">${escapeHtml(
        profile.featured.label || profile.featured.url
      )} &rarr;</a></p>`
    : "";

  // Links carry an optional `group` ("personal" by default). A hairline divider
  // marks each change of group, so two Facebook glyphs in one row are still
  // legible as "hers" and "the company's".
  const rows = [];
  let group = "personal";
  if (profile.email) rows.push(iconLink("mail", profile.email, `mailto:${profile.email}`));
  if (profile.phone)
    rows.push(iconLink("phone", profile.phoneDisplay || profile.phone, `tel:${profile.phone}`));
  for (const link of visibleLinks(profile)) {
    const linkGroup = link.group || "personal";
    if (rows.length && linkGroup !== group) {
      rows.push('<li class="sep" aria-hidden="true"></li>');
    }
    group = linkGroup;
    rows.push(iconLink(link.type, link.label || link.display || prettyUrl(link.url), link.url));
  }

  const footer = orgUrl
    ? `<footer class="foot">${escapeHtml(orgUrl.replace(/^https?:\/\//, "").replace(/\/+$/, ""))}</footer>`
    : "";

  const description = [profile.fullName, orgName].filter(Boolean).join(" · ");

  return tpl
    .replaceAll("{{TITLE}}", escapeHtml(description || profile.fullName))
    .replaceAll("{{DESCRIPTION}}", escapeHtml(description))
    .replaceAll("{{FULL_NAME}}", escapeHtml(profile.fullName))
    .replaceAll("{{EYEBROW}}", eyebrow)
    .replaceAll("{{ROLES}}", roles)
    .replaceAll("{{ORG}}", org)
    .replaceAll("{{FEATURED}}", featured)
    .replaceAll("{{LINKS}}", rows.join("\n      "))
    .replaceAll("{{FOOTER}}", footer);
}
