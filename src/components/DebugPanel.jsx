import { useState } from "react";
import { C } from "../utils/constants.js";

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

function EventICSCard({ ev }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    copyText(ev.rawICS || "").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const rruleMatch = ev.rawICS ? ev.rawICS.match(/RRULE:[^\r\n]+/) : null;
  const rrule = rruleMatch ? rruleMatch[0] : null;
  const recId = ev.recurrenceId;

  return (
    <div style={{
      background: C.surface, borderRadius: 12,
      border: `1px solid ${C.border}`, marginBottom: 12,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "10px 14px 8px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {ev.title || "(sans titre)"}
          </div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {ev.startDate}{ev.startTime ? ` ${ev.startTime}` : ""}{ev.allDay ? " · Toute la journée" : ""}
          </div>
          {rrule && (
            <div style={{ fontSize: 10, color: C.accent, marginTop: 3, fontFamily: "monospace", wordBreak: "break-all" }}>
              {rrule}
            </div>
          )}
          {recId && (
            <div style={{ fontSize: 10, color: "#8B5E20", marginTop: 2, fontFamily: "monospace" }}>
              RECURRENCE-ID: {recId}
            </div>
          )}
        </div>
        <button onClick={handleCopy} style={{
          flexShrink: 0,
          fontSize: 11, fontWeight: 700,
          background: copied ? C.green : C.accentLight,
          color: copied ? "#fff" : C.accent,
          border: "none", borderRadius: 8,
          padding: "5px 10px", cursor: "pointer",
          fontFamily: "inherit", transition: "all .2s",
          whiteSpace: "nowrap",
        }}>
          {copied ? "Copié ✓" : "Copier ICS"}
        </button>
      </div>
      <div style={{
        padding: "8px 14px",
        maxHeight: 180, overflowY: "auto",
        background: "#f7f3ee",
      }}>
        <pre style={{
          margin: 0, fontSize: 10,
          fontFamily: "monospace", color: "#3a4a5a",
          whiteSpace: "pre-wrap", wordBreak: "break-all",
          lineHeight: 1.6,
        }}>
          {ev.rawICS || "(pas de rawICS)"}
        </pre>
      </div>
    </div>
  );
}

export default function DebugPanel({ events, onBack }) {
  const [rruleOnly, setRruleOnly] = useState(true);

  const withRaw = events.filter(e => e.rawICS);
  const filtered = rruleOnly
    ? withRaw.filter(e => /RRULE:/.test(e.rawICS || ""))
    : withRaw;

  const rruleCount = withRaw.filter(e => /RRULE:/.test(e.rawICS || "")).length;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: C.bg,
      fontFamily: "Phenomena, Nunito, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 16px 10px",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <button onClick={onBack} style={{
            background: "none", border: "none",
            cursor: "pointer", padding: 4,
            color: C.accent, display: "flex", alignItems: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#8B5E20", letterSpacing: -0.5 }}>
              Debug ICS
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
              {withRaw.length} events avec ICS · {rruleCount} récurrents
            </div>
          </div>
        </div>

        {/* Filtre RRULE */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, color: C.ink }}>
            Filtrer : récurrents seulement
          </span>
          <div onClick={() => setRruleOnly(v => !v)} style={{
            width: 44, height: 26, borderRadius: 13,
            background: rruleOnly ? C.accent : C.border,
            cursor: "pointer", position: "relative", transition: "background .2s",
          }}>
            <div style={{
              position: "absolute", top: 3,
              left: rruleOnly ? 21 : 3,
              width: 20, height: 20, borderRadius: "50%",
              background: "#fff", transition: "left .2s",
              boxShadow: "0 1px 4px rgba(0,0,0,.2)",
            }}/>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 40px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted, fontSize: 14 }}>
            {rruleOnly
              ? "Aucun event récurrent avec ICS dans le cache.\nFais une synchro d'abord."
              : "Aucun event avec ICS dans le cache.\nFais une synchro d'abord."}
          </div>
        ) : (
          filtered.map(ev => <EventICSCard key={ev.id} ev={ev} />)
        )}
      </div>
    </div>
  );
}
