// api/feedback.js — NomadCal Feedback
// Log structuré multi-lignes pour lecture complète dans les logs Vercel

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  if (req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString());

    const id = `fb-${Date.now()}`;
    const ts = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });

    // Log en lignes courtes — jamais tronquées par Vercel
    console.log(`[FB_START] ${id}`);
    console.log(`[FB_TIME] ${ts}`);
    console.log(`[FB_USER] ${body.user || "Anonyme"}`);
    console.log(`[FB_PAGE] ${body.page || "NomadCal"}`);
    console.log(`[FB_TYPE] ${body.type || "note"}`);
    console.log(`[FB_MSG] ${body.message || ""}`);
    console.log(`[FB_END] ${id}`);

    res.status(200).json({ success: true, id });
    return;
  }

  res.status(405).json({ error: "Méthode non autorisée" });
}
