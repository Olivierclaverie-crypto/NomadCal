import { GRID_START, GRID_TOTAL, GRID_H, SLOT_H } from './constants.js';

// ── Storage ───────────────────────────────────────────────────────────────────
export const load = (k, def) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; }
  catch { return def; }
};
export const save = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

// ── Dates ─────────────────────────────────────────────────────────────────────
export const toISO = d => {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const j = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${j}`;
};
export const todayISO = () => toISO(new Date());

export function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - ((day + 6) % 7));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return toISO(d);
  });
}

export function fmtDay(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3);
}
export function fmtDayNum(iso) {
  return new Date(iso + "T12:00:00").getDate();
}
export function fmtMonth(iso) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { month: "short" });
}
export function fmtWeekRange(days) {
  const a = new Date(days[0] + "T12:00:00");
  const b = new Date(days[6] + "T12:00:00");
  const ma = a.toLocaleDateString("fr-FR", { month: "long" });
  const mb = b.toLocaleDateString("fr-FR", { month: "long" });
  const y  = b.getFullYear();
  if (ma === mb) return `${ma.charAt(0).toUpperCase() + ma.slice(1)} ${y}`;
  return `${ma.charAt(0).toUpperCase() + ma.slice(1)} – ${mb.charAt(0).toUpperCase() + mb.slice(1)} ${y}`;
}

// ── Grille horaire ────────────────────────────────────────────────────────────
export function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}
export function minutesToHHMM(min) {
  const h = Math.floor(min / 60).toString().padStart(2, "0");
  const m = (min % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
export function timeToY(hhmm) {
  const min = timeToMinutes(hhmm);
  return (min / GRID_TOTAL) * GRID_H;
}
export function durationToH(startHHMM, endHHMM) {
  const diff = timeToMinutes(endHHMM) - timeToMinutes(startHHMM);
  return (diff / GRID_TOTAL) * GRID_H;
}

// ── Tâches glissantes ─────────────────────────────────────────────────────────
export function slideTasksToToday(tasks) {
  const t = todayISO();
  return tasks.map(task => {
    if (task.done) return task;
    const eff = task.effectiveDate || task.createdAt?.slice(0, 10);
    if (eff && eff < t) return { ...task, effectiveDate: t };
    return task;
  });
}

// ── RRULE → français ──────────────────────────────────────────────────────────
export function rruleToFr(rrule) {
  if (!rrule) return "";
  const p = {};
  rrule.split(";").forEach(x => { const [k, v] = x.split("="); p[k] = v; });
  const interval = p.INTERVAL || "1";
  switch (p.FREQ) {
    case "DAILY":   return interval === "1" ? "Quotidien" : `Tous les ${interval} jours`;
    case "WEEKLY":
      if (p.BYDAY === "MO,TU,WE,TH,FR") return "Lun–Ven (jours ouvrés)";
      return interval === "1" ? "Hebdomadaire" : `Toutes les ${interval} semaines`;
    case "MONTHLY": return interval === "1" ? "Mensuel" : `Tous les ${interval} mois`;
    case "YEARLY":  return "Annuel";
    default: return "Récurrent";
  }
}

// ── Auth CalDAV ───────────────────────────────────────────────────────────────
export function makeAuthHeader(email, appPassword) {
  return "Basic " + btoa(`${email}:${appPassword}`);
}

// ── Préfixage clés localStorage par user ─────────────────────────────────────
// Format : nom@email + JJMMAAAA de 1ère connexion → ex: olivierclaverie31052026_
export function userPrefix(email) {
  if (!email) return "";
  const name = email.split("@")[0].replace(/[^a-z0-9]/gi,"").toLowerCase();
  const storageKey = "user_created_" + name;
  let date = localStorage.getItem(storageKey);
  if (!date) {
    const now = new Date();
    date = String(now.getDate()).padStart(2,"0")
         + String(now.getMonth()+1).padStart(2,"0")
         + now.getFullYear();
    localStorage.setItem(storageKey, date);
  }
  return name + date + "_";
}

export function uKey(email, key) {
  if (key === "cf_auth") return key;
  return userPrefix(email) + key;
}
