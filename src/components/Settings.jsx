import { useState } from "react";
import { C } from '../utils/constants.js';
import { userPrefix } from '../utils/helpers.js';

// ── Clés localStorage à protéger lors de la déconnexion ──────────────────────
const PROTECTED_KEYS = ["cf_auth"];

// ── Clés à exporter/importer ──────────────────────────────────────────────────
const EXPORT_KEYS = [
  "cf_tasks", "cf_events", "cf_calendars", "cf_settings",
  "nf4_notes", "nb_notes", "nb_periods", "nb_periods_cache", "nb_syntheses",
];

// ── Sauvegarde : nom logique → { clé, préfixée ? } ───────────────────────────
// Le nom logique + le flag prefixed permettent à la restauration de réécrire
// au bon endroit quel que soit le préfixe user du device d'import.
const BACKUP_ITEMS = [
  { logicalName: "notes",     key: "nb_notes",     prefixed: false },
  { logicalName: "nf4_notes", key: "nf4_notes",    prefixed: false },
  { logicalName: "periods",   key: "nb_periods",   prefixed: false },
  { logicalName: "syntheses", key: "nb_syntheses", prefixed: false },
  { logicalName: "tasks",     key: "cf_tasks",     prefixed: true  },
  { logicalName: "settings",  key: "cf_settings",  prefixed: true  },
];

// ── Copie presse-papier avec fallback iOS (même pattern que DebugPanel) ──────
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
  document.body.appendChild(el);
  el.select();
  try { document.execCommand("copy"); } catch (_) {}
  document.body.removeChild(el);
  return Promise.resolve();
}

export default function Settings({ settings, setSettings, calendars, onBack, auth, onOpenDebug }) {
  const [importStatus, setImportStatus] = useState(null); // "success" | "error"
  const [backupMsg, setBackupMsg]       = useState(null); // résumé chiffré après copie

  const iStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: `1.5px solid ${C.border}`, background: C.bg,
    color: C.ink, fontSize: 14, fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: 11, color: C.muted, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: .5,
    marginBottom: 6, display: "block",
  };

  const sectionStyle = {
    background: C.surface, borderRadius: 16,
    padding: "16px", marginBottom: 16,
    border: `1px solid ${C.border}`,
  };

  // ── Déconnexion — supprime UNIQUEMENT cf_auth ─────────────────────────────
  function handleLogout() {
    if (!window.confirm("Se déconnecter ? Vos notes, tâches et synthèses restent sauvegardées.")) return;
    PROTECTED_KEYS.forEach(k => localStorage.removeItem(k));
    window.location.reload();
  }

  // ── Sauvegarde — empaquette 6 clés ciblées + copie presse-papier ──────────
  // Lecture seule : aucune écriture localStorage. Format portable (nom logique
  // + flag prefixed) pour restauration sur n'importe quel device/préfixe.
  function handleBackup() {
    const prefix = userPrefix(auth?.email);
    const items = [];
    BACKUP_ITEMS.forEach(item => {
      const storageKey = item.prefixed ? prefix + item.key : item.key;
      const raw = localStorage.getItem(storageKey);
      if (raw === null) return; // clé absente → on saute (ex: nb_periods legacy)
      let value;
      try { value = JSON.parse(raw); } catch { value = raw; }
      items.push({ logicalName: item.logicalName, prefixed: item.prefixed, value });
    });

    const backup = {
      format: "nomadcal-backup",
      version: 1,
      createdAt: new Date().toISOString(),
      data: items,
    };

    // Résumé chiffré pour confirmer ce qui vient d'être capturé
    const notesEntry = items.find(i => i.logicalName === "notes");
    const tasksEntry = items.find(i => i.logicalName === "tasks");
    const nCount = Array.isArray(notesEntry?.value) ? notesEntry.value.length : 0;
    const tCount = Array.isArray(tasksEntry?.value) ? tasksEntry.value.length : 0;
    const summary = `${nCount} note${nCount > 1 ? "s" : ""} · ${tCount} tâche${tCount > 1 ? "s" : ""} · réglages`;

    copyText(JSON.stringify(backup)).then(() => {
      setBackupMsg(summary);
      setTimeout(() => setBackupMsg(null), 6000);
    });
  }

  // ── Import JSON — restaure toutes les données ─────────────────────────────
  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        let restored = 0;
        Object.keys(data).forEach(k => {
          if (k.startsWith("_")) return; // Ignore _exportDate, _email
          localStorage.setItem(k, typeof data[k] === "string" ? data[k] : JSON.stringify(data[k]));
          restored++;
        });
        setImportStatus("success");
        setTimeout(() => { setImportStatus(null); window.location.reload(); }, 1500);
      } catch {
        setImportStatus("error");
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div style={{ height: "100dvh", background: C.bg, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontSize: 16, fontWeight: 700, fontFamily: "inherit", padding: "4px 8px" }}>← Retour</button>
        <span style={{ fontSize: 18, fontWeight: 800, color: C.ink, fontFamily: "Phenomena, sans-serif", flex: 1 }}>Paramètres</span>
        <span style={{ fontSize: 11, color: C.muted, background: C.accentLight, border: `1px solid ${C.accentBorder}`, borderRadius: 8, padding: "2px 8px" }}>
          {auth?.email?.split("@")[0]}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "16px", paddingBottom: 60 }}>

        {/* AFFICHAGE */}
        <div style={{ ...sectionStyle }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 14, fontFamily: "Phenomena, sans-serif", letterSpacing: .5 }}>Affichage</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Heure début</label>
              <select value={settings.startHour || "8"} onChange={e => setSettings(s => ({ ...s, startHour: e.target.value }))} style={iStyle}>
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}h00</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Heure fin</label>
              <select value={settings.endHour || "20"} onChange={e => setSettings(s => ({ ...s, endHour: e.target.value }))} style={iStyle}>
                {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{i}h00</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, color: C.ink }}>Afficher les tâches terminées</span>
            <div onClick={() => setSettings(s => ({ ...s, showDone: !s.showDone }))}
              style={{ width: 44, height: 26, borderRadius: 13, background: settings.showDone ? C.green : C.border, cursor: "pointer", position: "relative", transition: "background .2s" }}>
              <div style={{ position: "absolute", top: 3, left: settings.showDone ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }}/>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <div>
              <span style={{ fontSize: 14, color: C.ink }}>Mode diagnostic (toast sync)</span>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Affiche le résultat des envois iCloud à l'écran</div>
            </div>
            <div onClick={() => setSettings(s => ({ ...s, debugToast: !s.debugToast }))}
              style={{ width: 44, height: 26, borderRadius: 13, background: settings.debugToast ? C.accent : C.border, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0, marginLeft: 12 }}>
              <div style={{ position: "absolute", top: 3, left: settings.debugToast ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }}/>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <div>
              <span style={{ fontSize: 14, color: C.ink }}>Mode debug — voir ICS reçus</span>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Conserve le ICS brut iCloud pour analyse des récurrences</div>
            </div>
            <div onClick={() => setSettings(s => ({ ...s, showDebugPanel: !s.showDebugPanel }))}
              style={{ width: 44, height: 26, borderRadius: 13, background: settings.showDebugPanel ? "#8B5E20" : C.border, cursor: "pointer", position: "relative", transition: "background .2s", flexShrink: 0, marginLeft: 12 }}>
              <div style={{ position: "absolute", top: 3, left: settings.showDebugPanel ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }}/>
            </div>
          </div>
          {settings.showDebugPanel && (
            <button onClick={() => onOpenDebug && onOpenDebug()} style={{
              marginTop: 10, width: "100%",
              padding: "10px", borderRadius: 10,
              border: `1.5px solid #8B5E20`,
              background: "#fdf3e3", color: "#8B5E20",
              fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="2" stroke="#8B5E20" strokeWidth="1.7"/>
                <path d="M7 8h4M7 12h8M7 16h5" stroke="#8B5E20" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="18" cy="8" r="2.5" fill="#F5C97A"/>
              </svg>
              Voir ICS reçus
            </button>
          )}
        </div>

        {/* CALENDRIERS */}
        <div style={{ ...sectionStyle }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 14, fontFamily: "Phenomena, sans-serif", letterSpacing: .5 }}>Calendriers</div>
          <label style={labelStyle}>Calendrier par défaut</label>
          <select value={settings.defaultCalHref || ""} onChange={e => setSettings(s => ({ ...s, defaultCalHref: e.target.value }))}
            style={{ ...iStyle, marginBottom: 14, borderColor: calendars.find(c => c.href === settings.defaultCalHref)?.color || C.border, borderWidth: 2 }}>
            {calendars.map(c => <option key={c.href} value={c.href}>{c.displayName}</option>)}
          </select>
        </div>

        {/* FRAIS PREMIUM */}
        <div style={{ ...sectionStyle, borderColor: C.gold, borderWidth: 1.5 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.goldDark, fontFamily: "Phenomena, sans-serif", letterSpacing: .5, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={C.goldDark} strokeWidth="1.6"/><path d="M15 9.3A4 4 0 0012 8c-2.2 0-3.8 1.8-3.8 4s1.6 4 3.8 4a4 4 0 003-1.3M7.6 11h6M7.6 13.2h5" stroke={C.goldDark} strokeWidth="1.5" strokeLinecap="round"/></svg>
              Frais — Premium
            </div>
            <span style={{ fontSize: 10, background: C.goldLight, color: C.goldDark, border: `1px solid ${C.gold}`, borderRadius: 10, padding: "2px 8px", fontWeight: 700 }}>Bientôt</span>
          </div>
          {[
            { key: "forfaitKm",       label: "Forfait km" },
            { key: "forfaitRepas",    label: "Forfait repas" },
            { key: "forfaitNuitee",   label: "Forfait nuitée" },
            { key: "forfaitInternet", label: "Forfait internet" },
            { key: "forfaitTel",      label: "Forfait tél." },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 14, color: C.ink }}>{label}</span>
              <input type="number" placeholder="0,00 €" value={settings[key] || ""} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} style={{ ...iStyle, width: 90, marginBottom: 0, opacity: .6 }} disabled/>
            </div>
          ))}
        </div>

        {/* SAUVEGARDE & RESTAURATION */}
        <div style={{ ...sectionStyle, borderColor: C.accentBorder, borderWidth: 1.5 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, marginBottom: 6, fontFamily: "Phenomena, sans-serif", letterSpacing: .5 }}>
            Sauvegarde & Restauration
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
            Copie un point de restauration de tes notes, tâches, synthèses et réglages. Colle-le dans un message ou une note pour le garder en lieu sûr.
          </div>

          <button onClick={handleBackup} style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1.5px solid ${C.accentBorder}`, background: C.accentLight, color: C.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
            Sauvegarder mes données
          </button>

          {backupMsg && (
            <div style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 10, background: C.greenLight, border: `1px solid ${C.green}44`, color: C.green, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
              Copié ✓ — {backupMsg}
            </div>
          )}

          <label style={{ display: "block", width: "100%", padding: "11px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bg, color: C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textAlign: "center", boxSizing: "border-box" }}>
            Importer une sauvegarde
            <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }}/>
          </label>

          {importStatus === "success" && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: C.greenLight, border: `1px solid ${C.green}44`, color: C.green, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
              ✓ Données restaurées — rechargement…
            </div>
          )}
          {importStatus === "error" && (
            <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: C.redLight, border: `1px solid ${C.red}44`, color: C.red, fontSize: 13, fontWeight: 700, textAlign: "center" }}>
              Fichier invalide — vérifie le format
            </div>
          )}
        </div>

        {/* DÉCONNEXION — ne supprime QUE cf_auth */}
        <button onClick={handleLogout} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${C.red}44`, background: C.redLight, color: C.red, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
          Se déconnecter
        </button>
        <div style={{ fontSize: 11, color: C.muted, textAlign: "center", marginTop: 8, marginBottom: 20 }}>
          La déconnexion ne supprime pas tes données locales.
        </div>

      </div>
    </div>
  );
}
