// Merge sans perte : events iCloud + locaux _pending non encore indexés + done- locaux.
// _pending:true  → création locale pas encore indexée par iCloud (id absent côté iCloud)
// _pendingEdit:true → édition locale dont le PUT n'est pas encore confirmé
// tombstones → ids supprimés localement : à ignorer même si iCloud les renvoie encore
export function mergeEvents(icloudEvents, localEvents, tombstones = []) {
  const icloudIds = new Set(icloudEvents.map(e => e.id));
  const tombstoneIds = new Set(tombstones);

  // IDs dont l'édition locale prime : exclure la version iCloud pour éviter un doublon
  const pendingEditIds = new Set(
    localEvents.filter(e => e._pendingEdit === true).map(e => e.id)
  );

  const preserved = localEvents.filter(e =>
    !tombstoneIds.has(e.id) && (
      e.id?.startsWith("done-") ||
      (e._pending === true && !icloudIds.has(e.id)) ||
      e._pendingEdit === true
    )
  );

  const icloudFiltered = icloudEvents.filter(e =>
    !pendingEditIds.has(e.id) && !tombstoneIds.has(e.id)
  );

  return [...icloudFiltered, ...preserved];
}
