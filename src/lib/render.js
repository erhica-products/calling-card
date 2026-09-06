import { readFile } from "node:fs/promises";

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// A link is shown in the contacts list unless it just repeats the org website,
// which already appears as the organization line under the name.
function visibleLinks(profile) {
  const orgUrl = (profile.organization?.url || "").replace(/\/+$/, "");
  return (profile.links || []).filter(
    (l) => l.url && l.url.replace(/\/+$/, "") !== orgUrl
  );
}

// "https://www.facebook.com/name/" -> "facebook.com/name"
function prettyUrl(url = "") {
  return String(url).replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}

function contactRow(label, value, href) {
  // mailto:/tel: stay in place; anything on the web opens in a new tab.
  const external = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : "";
  return `<li><a href="${escapeHtml(href)}"${external}><span class="label">${escapeHtml(
    label
  )}</span><span class="value">${escapeHtml(value)}</span></a></li>`;
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

  const rows = [];
  if (profile.email) rows.push(contactRow("Email", profile.email, `mailto:${profile.email}`));
  if (profile.phone)
    rows.push(contactRow("Phone", profile.phoneDisplay || profile.phone, `tel:${profile.phone}`));
  for (const link of visibleLinks(profile)) {
    // `label` names the row (two Facebook links need two different names);
    // `display` is what the row shows, defaulting to a tidied-up URL.
    rows.push(
      contactRow(link.label || link.type || "Link", link.display || prettyUrl(link.url), link.url)
    );
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
    .replaceAll("{{CONTACTS}}", rows.join("\n      "))
    .replaceAll("{{FOOTER}}", footer);
}
