// Central runtime configuration. Reads from environment with safe defaults so
// the server boots with zero setup. Override via a .env-style process env.
export const config = {
  port: Number(process.env.PORT) || 3000,
  // How contact submissions are handled. "log" simply prints them.
  // Swap for "email", "db", "queue", etc. in src/routes/contact.js.
  contactSink: process.env.CONTACT_SINK || "log",
  // Path to the profile that powers the card + vCard. Fully placeholder-driven.
  profilePath: process.env.PROFILE_PATH || "data/profile.json",
};
