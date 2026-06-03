// ============================================================
//  utils/photoStore.js
//  ⚠️  utils/  → tourne dans le NAVIGATEUR (client).
//      Ne JAMAIS confondre avec api/ (proxy serveur Vercel).
// ============================================================
//
//  RÔLE : "le vestiaire des photos".
//  La note (localStorage) ne garde qu'un TICKET (un petit id texte).
//  La vraie photo (lourde) est rangée ICI, dans IndexedDB.
//
//  API publique (ce que NomadBook appellera au Morceau 2) :
//    compressImage(file)        -> Blob compressé (léger)
//    savePhoto(blob)            -> id (le ticket)
//    getPhotoURL(id)            -> URL affichable dans <img src=...>
//    deletePhoto(id)            -> retire la photo du vestiaire
//    requestPersistentStorage() -> demande à iOS de protéger nos données
// ============================================================

const DB_NAME = "nomadcal-photos";
const DB_VERSION = 1;
const STORE_NAME = "photos";

// --- Ouvre (ou crée) la base. Renvoie une promesse vers la base. ---
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Génère un identifiant unique (le "ticket" de vestiaire). ---
function newId() {
  return "ph_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
}

// --- COMPRESSION : réduit une photo AVANT de la stocker. ---
// maxWidth = largeur max en pixels ; quality = 0 à 1 (0.7 = 70%).
export function compressImage(file, maxWidth = 1600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Recalcule la taille en gardant les proportions.
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Compression echouee"));
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible"));
    };
    img.src = url;
  });
}

// --- SAVE : range un blob au vestiaire, renvoie son ticket (id). ---
export async function savePhoto(blob) {
  const db = await openDB();
  const id = newId();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => {
      db.close();
      resolve(id);
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// --- GET (blob) : récupère le blob brut par son ticket. ---
export async function getPhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => {
      db.close();
      resolve(req.result || null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

// --- GET (url) : récupère une URL affichable dans une balise <img>. ---
// IMPORTANT (note pour le Morceau 2) : penser a liberer l'URL avec
// URL.revokeObjectURL(url) quand la vignette n'est plus affichee,
// pour eviter une fuite de memoire.
export async function getPhotoURL(id) {
  const blob = await getPhoto(id);
  return blob ? URL.createObjectURL(blob) : null;
}

// --- DELETE : retire la photo du vestiaire. ---
export async function deletePhoto(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// --- PERSISTENCE : demande a iOS de proteger nos donnees de l'effacement.
// A appeler une fois au demarrage (Morceau 2). Renvoie true si accorde.
export async function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    try {
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}
