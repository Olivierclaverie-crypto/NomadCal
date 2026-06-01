// api/feedback.js — NomadCal Feedback
// Stocke les feedbacks dans les logs Vercel — lisibles par Claude avant chaque session

export const config = { maxDuration: 10 };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  if (req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = JSON.parse(Buffer.concat(chunks).toString());

    const feedback = {
      id:        `fb-${Date.now()}`,
      timestamp: new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" }),
      user:      body.user     || "Anonyme",
      page:      body.page     || "NomadCal",
      type:      body.type     || "note",
      message:   body.message  || "",
      version:   body.appVersion || "v1",
    };

    // Log structuré — lisible par Claude via get_runtime_logs
    console.log("NOMADCAL_FEEDBACK:" + JSON.stringify(feedback));

    res.status(200).json({ success: true, id: feedback.id });
    return;
  }

  res.status(405).json({ error: "Méthode non autorisée" });
}
