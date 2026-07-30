import express from "express";
import { fileURLToPath } from "node:url";
import { config } from "./config.js";
import { cardRouter } from "./routes/card.js";
import { vcardRouter } from "./routes/vcard.js";
import { contactRouter } from "./routes/contact.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static assets (CSS, images, favicon)
  app.use(express.static(fileURLToPath(new URL("../public", import.meta.url))));

  // Health check for uptime probes / load balancers
  app.get("/healthz", (_req, res) => res.json({ ok: true }));

  app.use(cardRouter);
  app.use(vcardRouter);
  app.use(contactRouter);

  // 404
  app.use((_req, res) => res.status(404).json({ ok: false, error: "not found" }));

  // Central error handler
  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ ok: false, error: "internal server error" });
  });

  return app;
}

// Only listen when run directly (keeps the app importable in tests)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp().listen(config.port, () => {
    console.log(`Calling-card backend listening on http://localhost:${config.port}`);
  });
}
