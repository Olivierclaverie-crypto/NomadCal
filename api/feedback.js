// api/feedback.js — Bouton feedback NomadCal
// Stocke les feedbacks en mémoire Vercel (fichier JSON via Edge Config)
// + Envoie notification email via mailto

export const config = { maxDuration: 10 };

// Stockage simple — tableau en mémoire Vercel KV simulé via global
// Pour un stockage persistant, utiliser @vercel/kv ou une DB externe
const FEEDBACKS_KEY = "nomadcal_feedbacks";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  // ── POST — Enregistre un feedback ────────────────────────────────────────
  if (req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString());

    const feedback = {
      id:        `fb-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user:      body.user     || "Anonyme",
      page:      body.page     || "NomadCal",
      type:      body.type     || "note",      // bug / idee / super / frustration
      message:   body.message  || "",
      appVersion:body.appVersion || "v1",
      userAgent: req.headers["user-agent"] || "",
    };

    // Stockage dans Vercel KV si disponible, sinon log serveur
    try {
      // Tente d'utiliser @vercel/kv si configuré
      const { kv } = await import("@vercel/kv");
      const existing = await kv.get(FEEDBACKS_KEY) || [];
      existing.unshift(feedback); // Plus récent en premier
      // Garde les 200 derniers feedbacks max
      const trimmed = existing.slice(0, 200);
      await kv.set(FEEDBACKS_KEY, trimmed);
      console.log(`[Feedback] Sauvegardé KV: ${feedback.type} — ${feedback.user}`);
    } catch {
      // KV non configuré — log serveur uniquement
      console.log(`[Feedback] ${feedback.timestamp} | ${feedback.type} | ${feedback.user} | ${feedback.page} | ${feedback.message}`);
    }

    res.status(200).json({ success: true, id: feedback.id });
    return;
  }

  // ── GET — Récupère tous les feedbacks (lecture par Claude) ───────────────
  if (req.method === "GET") {
    // Vérification token simple
    const token = req.headers["x-feedback-token"] || req.query.token;
    if (token !== process.env.FEEDBACK_TOKEN) {
      res.status(401).json({ error: "Non autorisé" });
      return;
    }

    try {
      const { kv } = await import("@vercel/kv");
      const feedbacks = await kv.get(FEEDBACKS_KEY) || [];
      res.status(200).json({ feedbacks, count: feedbacks.length });
    } catch {
      res.status(200).json({ feedbacks: [], count: 0, note: "KV non configuré" });
    }
    return;
  }

  res.status(405).json({ error: "Méthode non autorisée" });
}
