// ── CalDAV helpers ────────────────────────────────────────────────────────────

// Méthodes HTTP standard acceptées par le routage Vercel. Les méthodes WebDAV
// (PROPFIND, REPORT, MKCALENDAR) sont rejetées en 405 (x-vercel-error:
// INVALID_REQUEST_METHOD) AVANT d'atteindre la fonction proxy → on les tunnelise
// en POST + en-tête X-HTTP-Method-Override, que le proxy rétablit vers iCloud.
const STD_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]);

export async function caldavRequest(method, path, auth, body = "", extraHeaders = {}, timeoutMs = 20000) {
  // Timeout dur : une requête CalDAV qui pend (hang mobile WKWebView : socket figée
  // sur bascule WiFi↔cellulaire) devient un échec borné, sinon elle bloque la synchro.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const tunnel = !STD_METHODS.has(method);          // méthode WebDAV → à tunneliser
  const wireMethod = tunnel ? "POST" : method;      // ce que voit Vercel
  const headers = {
    "Authorization": auth,
    "Content-Type": "application/xml; charset=utf-8",
    ...extraHeaders,
  };
  if (tunnel) headers["X-HTTP-Method-Override"] = method; // le proxy rétablit le vrai verbe

  try {
    const res = await fetch(`/api/caldav?path=${encodeURIComponent(path)}`, {
      method: wireMethod,
      headers,
      body: wireMethod === "GET" || wireMethod === "HEAD" ? undefined : body,
      signal: controller.signal,
    });
    const text = await res.text();
    return { status: res.status, text };
  } catch (err) {
    // Abort (timeout) → échec propre dans le contrat { status, text }, aucun appelant impacté.
    if (err.name === "AbortError") return { status: 408, text: "" };
    throw err; // vraie erreur réseau : comportement inchangé
  } finally {
    clearTimeout(timer);
  }
}

export function parseCalendars(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const responses = doc.querySelectorAll("response");
  const cals = [];
  responses.forEach(r => {
    const href = r.querySelector("href")?.textContent || "";
    const displayName = r.querySelector("displayname")?.textContent
      || href.split("/").filter(Boolean).pop() || "Sans nom";
    const color = r.querySelector("calendar-color")?.textContent || "#2B5A9E";
    const isCalendar = r.querySelector("resourcetype calendar") !== null;
    if (isCalendar && href) {
      cals.push({ href, displayName, color: color.slice(0, 7) });
    }
  });
  return cals;
}

export function parseEvents(xml, calHref, calColor, calName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const responses = doc.querySelectorAll("response");
  const events = [];
  responses.forEach(r => {
    const href = r.querySelector("href")?.textContent || "";
    const calData = r.querySelector("calendar-data")?.textContent || "";
    if (!calData) return;
    // iCloud livre master + occurrences modifiées (RECURRENCE-ID) dans la MÊME
    // ressource → on découpe TOUS les blocs VEVENT et on parse chacun.
    const unfolded = calData.replace(/\r\n[ \t]/g, "").replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
    const blocks = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) || [];
    if (blocks.length <= 1) {
      // Cas simple (0 ou 1 VEVENT) : chemin identique à avant → non-régression stricte.
      try {
        const ev = parseICS(calData, href, calHref, calColor, calName);
        if (ev) events.push(ev);
      } catch (e) {}
    } else {
      // Master + exceptions : un objet par bloc (rawICS reste l'enveloppe complète).
      blocks.forEach(block => {
        try {
          const ev = parseICS(calData, href, calHref, calColor, calName, block);
          if (ev) events.push(ev);
        } catch (e) {}
      });
    }
  });
  return events;
}

export function parseICS(ics, href, calHref, calColor, calName, veventBlock = null) {
  // ── Fix iOS : unfold les lignes continues ──────────────────────────────────
  const unfolded = ics.replace(/\r\n[ \t]/g, "").replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "");
  // ── Isolation du bloc VEVENT ────────────────────────────────────────────────
  // veventBlock fourni (multi-VEVENT : master OU exception) → on parse ce bloc précis.
  // Sinon : 1er VEVENT de l'enveloppe (évite aussi le RRULE du VTIMEZONE, annuel).
  const veventMatch = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/);
  const lines = (veventBlock || (veventMatch ? veventMatch[0] : unfolded)).split("\n");

  const get = key => {
    const line = lines.find(l => l.startsWith(key + ":") || l.startsWith(key + ";"));
    if (!line) return null;
    return line.replace(/^[^:]+:/, "").trim();
  };
  const getAll = key => lines
    .filter(l => l.startsWith(key + ":") || l.startsWith(key + ";"))
    .map(l => l.replace(/^[^:]+:/, "").trim());

  const uid      = get("UID");
  const summary  = get("SUMMARY") || "(sans titre)";
  const dtstart  = get("DTSTART");
  const dtend    = get("DTEND");
  const loc      = get("LOCATION") || "";
  const desc = get("DESCRIPTION") || "";
  const descNorm = desc.replace(/\\n/g, "\n");

  // Email depuis URL:mailto: (nouveau modèle) avec fallback ancien marqueur
  const urlField = get("URL") || "";
  const emailFromUrl = urlField.startsWith("mailto:") ? urlField.slice(7).trim() : "";

  // Téléphone depuis CONTACT (nouveau modèle) avec fallback ancien marqueur
  const contactField = get("CONTACT") || "";

  // ── Compat descendante : anciens events avec marqueurs DESCRIPTION ─────────
  const extractField = (label) => {
    const match = descNorm.match(new RegExp("^" + label + ":\\s*(.+)$", "m"));
    return match ? match[1].trim() : "";
  };
  const legacyTel   = extractField("Tél");
  const legacyEmail = extractField("Email");

  // Valeurs finales : nouveau modèle prioritaire, fallback ancien
  const finalEmail = emailFromUrl || legacyEmail;
  const finalTel   = contactField || legacyTel;

  // Notes : si anciens marqueurs présents, couper avant "---"
  const notesLibres = descNorm.split(/\n---\n/)[0].trim();

  const rrule    = get("RRULE") || "";
  const status   = get("STATUS") || "CONFIRMED";

  // ── Fix EXDATE — gère les timezones et formats multiples ──────────────────
  const exdates = getAll("EXDATE").flatMap(s =>
    s.split(",").map(d => {
      const clean = d.replace(/;[^:]*:/, "").replace(/TZID=[^:]+:/, "").replace(/Z$/, "").trim();
      if (clean.length >= 8) {
        return clean.slice(0,4) + "-" + clean.slice(4,6) + "-" + clean.slice(6,8);
      }
      return null;
    }).filter(Boolean)
  );

  if (!uid || !dtstart) return null;

  const allDay = !dtstart.includes("T") || dtstart.includes("VALUE=DATE");

  // ── Fix timezone iOS Safari — parse date en heure locale ──────────────────
  const parseDate = s => {
    if (!s) return null;
    // Retire les paramètres TZID et autres
    const clean = s.replace(/^[^:]+:/, "").replace(/Z$/, "").trim();
    if (clean.length === 8) {
      // Date seule YYYYMMDD
      return clean.slice(0,4) + "-" + clean.slice(4,6) + "-" + clean.slice(6,8);
    }
    // DateTime YYYYMMDDTHHMMSS
    const y  = clean.slice(0,4);
    const mo = clean.slice(4,6);
    const d  = clean.slice(6,8);
    const h  = clean.length >= 13 ? clean.slice(9,11) : "00";
    const mi = clean.length >= 15 ? clean.slice(11,13) : "00";
    return { date: `${y}-${mo}-${d}`, time: `${h}:${mi}` };
  };

  const start = parseDate(dtstart);
  const end   = parseDate(dtend);

  // ── Statut événement → emoji sobre ────────────────────────────────────────
  const evStatus = status.toUpperCase() === "CANCELLED" ? "cancelled"
    : status.toUpperCase() === "TENTATIVE" ? "tentative"
    : "confirmed";

  return {
    id: uid, href, calHref, calColor, calName,
    title: summary, allDay,
    startDate: allDay ? start : (typeof start === "string" ? start : start?.date),
    startTime: allDay ? null : (typeof start === "object" ? start?.time : null),
    endDate:   allDay ? (typeof end === "string" ? end : end?.date) : (typeof end === "object" ? end?.date : null),
    endTime:   allDay ? null : (typeof end === "object" ? end?.time : null),
    location: loc,
    adresse: loc,
    email: finalEmail,
    tel: finalTel,
    notes: notesLibres,
    rrule, exdates,
    status: evStatus,
    type: "event",
    rawICS: ics,
    recurrenceId: get("RECURRENCE-ID") || null,
  };
}

// ── Helper : convertit YYYYMMDD ou Date en ISO string ─────────────────────────
function toISO(d) {
  if (typeof d === "string") return d.slice(0,10);
  return d.toISOString().slice(0,10);
}
function toLocalISO(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth()+1).padStart(2,"0") + "-" +
    String(d.getDate()).padStart(2,"0");
}
function toTime(d) {
  return d.toTimeString().slice(0,5);
}

// ── Helper : nième jour de la semaine dans un mois ────────────────────────────
// Ex: 3MO = 3ème lundi, -1FR = dernier vendredi
function nthWeekdayOfMonth(year, month, dayCode, n) {
  const DAYS = { SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6 };
  const target = DAYS[dayCode];
  if (target === undefined) return null;

  if (n > 0) {
    // nème occurrence depuis le début du mois
    const first = new Date(year, month, 1);
    const diff  = (target - first.getDay() + 7) % 7;
    const day   = 1 + diff + (n - 1) * 7;
    const date  = new Date(year, month, day);
    return date.getMonth() === month ? date : null;
  } else {
    // nème occurrence depuis la fin du mois (n=-1 = dernier)
    const last = new Date(year, month + 1, 0);
    const diff = (last.getDay() - target + 7) % 7;
    const day  = last.getDate() - diff + (n + 1) * 7;
    const date = new Date(year, month, day);
    return date.getMonth() === month ? date : null;
  }
}

export function expandRecurring(ev, rangeStart, rangeEnd) {
  if (!ev.rrule) return [ev];

  const params = {};
  ev.rrule.split(";").forEach(p => {
    const [k, v] = p.split("=");
    params[k] = v;
  });

  const freq     = params.FREQ;
  const count    = params.COUNT ? parseInt(params.COUNT) : 500;
  const interval = params.INTERVAL ? parseInt(params.INTERVAL) : 1;
  const DAYS_MAP = { SU:0, MO:1, TU:2, WE:3, TH:4, FR:5, SA:6 };
  const DAY_CODES= ["SU","MO","TU","WE","TH","FR","SA"];

  // ── Parse UNTIL as UTC instant (RFC 5545 : UNTIL is always UTC) ─────────────
  let untilTs = null;
  if (params.UNTIL) {
    const u = params.UNTIL.replace(/Z$/, "");
    untilTs = Date.UTC(
      +u.slice(0,4), +u.slice(4,6)-1, +u.slice(6,8),
      u.length >= 13 ? +u.slice(9,11) : 23,
      u.length >= 15 ? +u.slice(11,13) : 59,
      u.length >= 17 ? +u.slice(13,15) : 59
    );
  }

  // ── Parse BYDAY ────────────────────────────────────────────────────────────
  // Peut être "MO,WE,FR" ou "3MO" ou "-1FR"
  const byDayRaw = params.BYDAY ? params.BYDAY.split(",") : null;

  // ── Parse BYMONTHDAY ──────────────────────────────────────────────────────
  const byMonthDay = params.BYMONTHDAY ? parseInt(params.BYMONTHDAY) : null;

  // ── Date de début event ────────────────────────────────────────────────────
  const startD   = new Date(ev.startDate + "T" + (ev.startTime || "12:00") + ":00");
  const endD     = new Date((ev.endDate || ev.startDate) + "T" + (ev.endTime || ev.startTime || "12:00") + ":00");
  const duration = endD - startD;

  const occurrences = [];
  let current = new Date(startD);
  let n = 0;
  let iterations = 0;

  while (n < count && iterations < 2000) {
    iterations++;
    const curISO = toISO(current);

    // Vérifie les bornes
    if (untilTs !== null && current.getTime() > untilTs) break;
    if (curISO > rangeEnd) break;

    // ── Calcul des occurrences selon FREQ ─────────────────────────────────
    let candidates = [];

    if (freq === "DAILY") {
      candidates = [new Date(current)];
    }
    else if (freq === "WEEKLY") {
      if (byDayRaw && byDayRaw.length > 1) {
        // Multi-jours : génère tous les jours de la semaine courante
        const weekStart = new Date(current);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Dimanche
        byDayRaw.forEach(dc => {
          const dayIdx = DAYS_MAP[dc.replace(/[^A-Z]/g, "")];
          if (dayIdx !== undefined) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + dayIdx);
            candidates.push(d);
          }
        });
      } else {
        candidates = [new Date(current)];
      }
    }
    else if (freq === "MONTHLY") {
      if (byDayRaw) {
        // Ex: BYDAY=3MO ou BYDAY=-1FR
        byDayRaw.forEach(dc => {
          const match = dc.match(/^(-?\d+)?([A-Z]{2})$/);
          if (!match) return;
          const nth     = match[1] ? parseInt(match[1]) : 1;
          const dayCode = match[2];
          const date    = nthWeekdayOfMonth(current.getFullYear(), current.getMonth(), dayCode, nth);
          if (date) candidates.push(date);
        });
      } else if (byMonthDay) {
        const d = new Date(current.getFullYear(), current.getMonth(), byMonthDay);
        if (d.getMonth() === current.getMonth()) candidates.push(d);
      } else {
        candidates = [new Date(current)];
      }
    }
    else if (freq === "YEARLY") {
      candidates = [new Date(current)];
    }

    // ── Ajoute les occurrences valides ────────────────────────────────────
    candidates.forEach(cand => {
      const candISO = toISO(cand);
      if (candISO < rangeStart) return;
      if (candISO > rangeEnd) return;
      if (untilTs !== null && cand.getTime() > untilTs) return;
      if (ev.exdates?.includes(toLocalISO(cand))) return;

      const occEnd = new Date(cand.getTime() + duration);

      // ── ID stable et unique — basé sur UID + date ─────────────────────
      // Évite les doublons lors de syncs multiples
      const stableId = `${ev.id}_${candISO.replace(/-/g,"")}`;

      occurrences.push({
        ...ev,
        id:             stableId,
        startDate:      candISO,
        startTime:      ev.allDay ? null : toTime(cand),
        endDate:        toISO(occEnd),
        endTime:        ev.allDay ? null : toTime(occEnd),
        isRecurring:    true,
        masterUid:      ev.id,
        recurrenceDate: candISO,
      });
      n++;
    });

    // ── Avance au prochain cycle ──────────────────────────────────────────
    const next = new Date(current);
    switch (freq) {
      case "DAILY":
        next.setDate(next.getDate() + interval);
        break;
      case "WEEKLY":
        if (byDayRaw && byDayRaw.length > 1) {
          // Avance d'une semaine entière
          next.setDate(next.getDate() + 7 * interval);
        } else {
          next.setDate(next.getDate() + 7 * interval);
        }
        break;
      case "MONTHLY":
        next.setMonth(next.getMonth() + interval);
        break;
      case "YEARLY":
        next.setFullYear(next.getFullYear() + interval);
        break;
      default:
        next.setDate(next.getDate() + 7);
    }
    current = next;
  }

  return occurrences.length > 0 ? occurrences : [ev];
}
