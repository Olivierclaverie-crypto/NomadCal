// ════════════════════════════════════════════════════════════════════════
// BOÎTE D'ENVOI — file d'attente des écritures faites hors-ligne.
// Une écriture impossible faute de réseau est rangée ici, puis rejouée
// automatiquement au retour du réseau (onOnline + au démarrage).
// ════════════════════════════════════════════════════════════════════════

export function loadQueue(email) {
  try { return JSON.parse(localStorage.getItem(`${email}_cf_pending`) || "[]"); } catch { return []; }
}

export function saveQueue(email, q) {
  try { localStorage.setItem(`${email}_cf_pending`, JSON.stringify(q)); } catch {}
}

export function enqueueWrite(email, entry) {
  const q = loadQueue(email);
  q.push({ ...entry, ts: Date.now() });
  saveQueue(email, q);
}
