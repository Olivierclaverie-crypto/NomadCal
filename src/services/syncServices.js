export async function runSync({ auth, syncing, flushQueue, syncCalDAV }) {
  if (!auth) return;
  if (syncing) return;

  // Si on a du réseau, on rejoue d'abord la file offline
  if (navigator.onLine && flushQueue) {
    await flushQueue(auth);
  }

  // Puis on lance la vraie synchro complète
  await syncCalDAV();
}
