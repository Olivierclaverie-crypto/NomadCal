// Merge sans perte : events iCloud + locaux _pending non encore indexés + done- locaux.
// Un event local avec _pending:true survit jusqu'à ce que son id apparaisse chez iCloud,
// puis la version iCloud (sans _pending) prend naturellement le relais.
export function mergeEvents(icloudEvents, localEvents) {
  const icloudIds = new Set(icloudEvents.map(e => e.id));

  const preserved = localEvents.filter(e =>
    e.id?.startsWith("done-") ||
    (e._pending === true && !icloudIds.has(e.id))
  );

  return [...icloudEvents, ...preserved];
}
