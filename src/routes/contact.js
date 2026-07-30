import { Router } from "express";
import { config } from "../config.js";

export const contactRouter = Router();

// POST /api/contact -> accept a message from a contact form.
// This is a working stub: it validates input and hands off to a "sink".
// Replace deliver() with email (nodemailer), a DB insert, or a queue push.
contactRouter.post("/api/contact", async (req, res, next) => {
  try {
    const { name, email, message } = req.body ?? {};

    const errors = [];
    if (!name || String(name).trim().length < 2) errors.push("name is required");
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) errors.push("valid email is required");
    if (!message || String(message).trim().length < 1) errors.push("message is required");
    if (errors.length) return res.status(422).json({ ok: false, errors });

    await deliver({ name, email, message, at: new Date().toISOString() });
    res.status(202).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

async function deliver(submission) {
  switch (config.contactSink) {
    // TODO: add "email" / "db" / "queue" cases as the backend grows.
    case "log":
    default:
      console.log("[contact] new submission:", submission);
  }
}
