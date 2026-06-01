import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// ── Service Worker — vérification MAJ à chaque ouverture ─────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");

      // Vérifie les MAJ à chaque fois que l'app devient visible
      // Critique pour Safari iOS qui endort le SW en arrière-plan
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          reg.update();
        }
      });

      // Écoute les nouvelles versions disponibles
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // Nouvelle version détectée → rechargement silencieux
            newWorker.postMessage("SKIP_WAITING");
            window.location.reload();
          }
        });
      });

    } catch (err) {
      console.warn("[SW] Échec enregistrement:", err);
    }
  });
}

createRoot(document.getElementById("root")).render(<App/>);
