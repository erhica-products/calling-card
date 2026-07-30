// Builds an RFC-6350-ish vCard 3.0 string from a profile object.
// Values are escaped per spec so names/orgs with commas or semicolons survive.
function esc(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

const SOCIAL_TYPES = new Set(["instagram", "facebook", "linkedin", "twitter", "x", "tiktok", "youtube"]);

export function buildVCard(profile) {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`N:${esc(profile.lastName)};${esc(profile.firstName)};;;`);
  lines.push(`FN:${esc(profile.fullName)}`);

  if (profile.organization?.name) lines.push(`ORG:${esc(profile.organization.name)}`);
  if (profile.roles?.length) lines.push(`TITLE:${esc(profile.roles.join(" / "))}`);
  if (profile.phone) lines.push(`TEL;TYPE=CELL,VOICE:${esc(profile.phone)}`);
  if (profile.email) lines.push(`EMAIL;TYPE=WORK:${esc(profile.email)}`);

  for (const link of profile.links || []) {
    if (!link.url) continue;
    if (link.type === "website" || link.type === "url") {
      lines.push(`URL:${esc(link.url)}`);
    } else if (SOCIAL_TYPES.has(link.type)) {
      lines.push(`X-SOCIALPROFILE;TYPE=${esc(link.type)}:${esc(link.url)}`);
    }
  }

  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}

// A filesystem-safe filename for the download, derived from the full name.
export function vcardFilename(profile) {
  const base = (profile.fullName || "contact")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base || "contact"}.vcf`;
}
