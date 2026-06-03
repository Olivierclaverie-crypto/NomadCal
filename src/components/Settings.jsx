import { useState } from "react";
import { C } from '../utils/constants.js';

// ── Clés localStorage à protéger lors de la déconnexion ──────────────────────
const PROTECTED_KEYS = ["cf_auth"];

// ── Clés à exporter/importer ──────────────────────────────────────────────────
const EXPORT_KEYS = [
  "cf_tasks", "cf_events", "cf_calendars", "cf_settings",
  "nf4_notes", "nb_notes", "nb_periods", "nb_periods_cache", "nb_syntheses",
];

export default function Settings({ settings, setSettings, calendars, onBack, auth }) {
  const [importStatus, setImportStatus] = useState(null); // "success" | "error"

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

  // ── Export JSON — toutes les données (clés brutes + clés préfixées user) ──
  function handleExport() {
    const data = {};
    // Parcourt TOUTES les clés localStorage → capture aussi les clés préfixées
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey === "cf_auth") continue; // Jamais exporter les identifiants
      const isRelevant = EXPORT_KEYS.some(k => fullKey === k || fullKey.endsWith("_" + k))
        || fullKey.startsWith("nb_") || fullKey.startsWith("nf4_");
      if (isRelevant) {
        try { data[fullKey] = JSON.parse(localStorage.getItem(fullKey)); }
        catch { data[fullKey] = localStorage.getItem(fullKey); }
      }
    }
    data._exportDate = new Date().toISOString();
    data._email = auth?.email || "unknown";

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nomadcal-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
            <div style={{ fontSize: 13, fontWeight: 800, color: C.goldDark, fontFamily: "Phenomena, sans-serif", letterSpacing: .5 }}>💰 Frais — Premium</div>
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
            Exporte toutes tes données (notes, tâches, synthèses, périodes) dans un fichier JSON. Conserve ce fichier précieusement — c'est ta sauvegarde complète.
          </div>

          <button onClick={handleExport} style={{ width: "100%", padding: "11px", borderRadius: 10, border: `1.5px solid ${C.accentBorder}`, background: C.accentLight, color: C.accent, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
            Exporter mes données (.json)
          </button>

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
