// api/caldav.js — Vercel Serverless Function
// Proxy CalDAV iCloud p59

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PROPFIND,REPORT,MKCALENDAR,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,Depth,Prefer,If-Match,If-None-Match,X-HTTP-Method-Override");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Method tunneling : les méthodes WebDAV arrivent en POST + X-HTTP-Method-Override
  // (le routage Vercel rejette PROPFIND/REPORT/MKCALENDAR en 405). On rétablit le vrai verbe.
  const realMethod = req.headers["x-http-method-override"] || req.method;

  const { path: caldavPath } = req.query;
  if (!caldavPath) {
    res.status(400).json({ error: "Missing path" });
    return;
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  const base = "https://caldav.icloud.com";
  const path = caldavPath.startsWith("/") ? caldavPath : "/" + caldavPath;
  const icloudUrl = `${base}${path}`;

  try {
    const fetchOptions = {
      method: realMethod,
      headers: {
        "Authorization": authHeader,
        "Content-Type": req.headers["content-type"] || "application/xml; charset=utf-8",
        "Depth": req.headers["depth"] || "0",
        "Prefer": req.headers["prefer"] || "",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) CalFlow/1.0",
        "Accept": "text/xml, application/xml",
      },
      redirect: "follow",
    };

    if (realMethod !== "GET" && realMethod !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      fetchOptions.body = Buffer.concat(chunks);
    }

    const response = await fetch(icloudUrl, fetchOptions);
    const text = await response.text();

    res.status(response.status);
    const ct = response.headers.get("content-type");
    if (ct) res.setHeader("Content-Type", ct);
    res.setHeader("X-Final-Url", response.url || icloudUrl);
    res.setHeader("X-Status", response.status);
    res.send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
