// Line icons for the contact row. Lucide (https://lucide.dev, ISC) at 1.75px
// stroke — the substitution the Good Cup design system names for UI icons
// beyond the five packaging icons.
//
// Keyed by link `type`; `mail` and `phone` are used for the profile's own
// email and phone fields. Add a key here to support a new link type.
const PATHS = {
  mail:
    '<rect width="20" height="16" x="2" y="4" rx="2"/>' +
    '<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6' +
    ' 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81' +
    ' 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0' +
    ' 2.81.7A2 2 0 0 1 22 16.92z"/>',
  website:
    '<circle cx="12" cy="12" r="10"/>' +
    '<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>' +
    '<path d="M2 12h20"/>',
  facebook:
    '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  instagram:
    '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>' +
    '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>' +
    '<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>' +
    '<rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  youtube:
    '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0' +
    'A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0' +
    'A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
  // Fallback for a type with no icon of its own.
  link:
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>' +
    '<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
};

export function icon(type) {
  const body = PATHS[type] || PATHS.link;
  return (
    '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
    'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ' +
    'focusable="false">' + body + "</svg>"
  );
}
