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
  // Dédup : la nouvelle action remplace toute tentative en attente pour le même event
  // (évite qu'une vieille édition périmée ressuscite un event supprimé entre-temps)
  const q = loadQueue(email).filter(item => item.ev?.id !== entry.ev?.id);
  q.push({ ...entry, ts: Date.now() });
  saveQueue(email, q);
}

// ════════════════════════════════════════════════════════════════════════
// TOMBSTONES — ids supprimés localement, à faire ignorer par le merge
// tant qu'iCloud n'a pas confirmé l'absence (cf. mergeStrategy.js).
// ════════════════════════════════════════════════════════════════════════

export function loadTombstones(email) {
  try { return JSON.parse(localStorage.getItem(`${email}_cf_tombstones`) || "[]"); } catch { return []; }
}

export function saveTombstones(email, ids) {
  try { localStorage.setItem(`${email}_cf_tombstones`, JSON.stringify(ids)); } catch {}
}

export function addTombstone(email, id) {
  const ids = loadTombstones(email);
  if (!ids.includes(id)) { ids.push(id); saveTombstones(email, ids); }
}

export function removeTombstone(email, id) {
  saveTombstones(email, loadTombstones(email).filter(x => x !== id));
}
