import { C } from '../utils/constants.js';

// ── Bouton générique ──────────────────────────────────────────────────────────
export function Btn({ onClick, children, variant = "default", style = {}, disabled = false }) {
  const base = {
    padding: "10px 16px",
    borderRadius: 10,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 700,
    border: "none",
    transition: "all .15s",
    opacity: disabled ? .5 : 1,
  };
  const v = {
    default: { background: C.bg, color: C.ink, border: `1px solid ${C.border}` },
    primary: { background: C.accent, color: "#fff", boxShadow: `0 2px 8px ${C.accent}44` },
    danger:  { background: C.redLight, color: C.red, border: `1px solid ${C.red}44` },
    gold:    { background: C.goldLight, color: C.goldDark, border: `1px solid ${C.gold}88` },
    soft:    { background: C.accentLight, color: C.accent, border: `1px solid ${C.accentBorder}` },
    ghost:   { background: "transparent", color: C.muted, border: "none" },
    outline: { background: "transparent", color: C.accent, border: `1.5px solid ${C.accent}` },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...v[variant], ...style }}>
      {children}
    </button>
  );
}

// ── Modal sheet ───────────────────────────────────────────────────────────────
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      {/* Backdrop flouté */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(15,29,43,.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />
      {/* Sheet */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 401,
        background: C.surface,
        borderRadius: "20px 20px 0 0",
        padding: "0 0 env(safe-area-inset-bottom, 20px)",
        maxHeight: "90dvh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 -8px 40px rgba(0,0,0,.18)",
      }}>
        {/* Handle */}
        <div style={{ padding: "10px 20px 0", flexShrink: 0 }}>
          <div style={{
            width: 36, height: 4,
            background: C.border,
            borderRadius: 2,
            margin: "0 auto 14px",
          }} />
          {/* Titre + fermer */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
            paddingBottom: 12,
            borderBottom: `1px solid ${C.border}`,
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 800,
              color: C.ink,
              fontFamily: "Phenomena, sans-serif",
            }}>
              {title}
            </span>
            <button onClick={onClose} style={{
              background: "none", border: "none",
              color: C.muted, cursor: "pointer",
              fontSize: 20, padding: 4, lineHeight: 1,
            }}>✕</button>
          </div>
        </div>
        {/* Contenu scrollable */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px 20px",
        }}>
          {children}
        </div>
      </div>
    </>
  );
}
