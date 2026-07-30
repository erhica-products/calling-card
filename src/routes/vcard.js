import { Router } from "express";
import { loadProfile } from "../lib/profile.js";
import { buildVCard, vcardFilename } from "../lib/vcard.js";

export const vcardRouter = Router();

// GET /vcard -> downloads a generated .vcf for the current profile
vcardRouter.get("/vcard", async (_req, res, next) => {
  try {
    const profile = await loadProfile();
    res
      .type("text/vcard; charset=utf-8")
      .set("Content-Disposition", `attachment; filename="${vcardFilename(profile)}"`)
      .send(buildVCard(profile));
  } catch (err) {
    next(err);
  }
});
