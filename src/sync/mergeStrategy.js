// Merge sans perte : events iCloud + locaux _pending non encore indexés + done- locaux.
// _pending:true  → création locale pas encore indexée par iCloud (id absent côté iCloud)
// _pendingEdit:true → édition locale dont le PUT n'est pas encore confirmé
export function mergeEvents(icloudEvents, localEvents) {
  const icloudIds = new Set(icloudEvents.map(e => e.id));

  // IDs dont l'édition locale prime : exclure la version iCloud pour éviter un doublon
  const pendingEditIds = new Set(
    localEvents.filter(e => e._pendingEdit === true).map(e => e.id)
  );

  const preserved = localEvents.filter(e =>
    e.id?.startsWith("done-") ||
    (e._pending === true && !icloudIds.has(e.id)) ||
    e._pendingEdit === true
  );

  return [...icloudEvents.filter(e => !pendingEditIds.has(e.id)), ...preserved];
}
