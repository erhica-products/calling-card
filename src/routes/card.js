import { Router } from "express";
import { loadProfile } from "../lib/profile.js";
import { renderCard } from "../lib/render.js";

export const cardRouter = Router();

// GET / -> the rendered calling card (HTML)
cardRouter.get("/", async (_req, res, next) => {
  try {
    const profile = await loadProfile();
    res.type("html").send(await renderCard(profile));
  } catch (err) {
    next(err);
  }
});

// GET /api/profile -> the raw profile as JSON (handy for a SPA/mobile client)
cardRouter.get("/api/profile", async (_req, res, next) => {
  try {
    res.json(await loadProfile());
  } catch (err) {
    next(err);
  }
});
