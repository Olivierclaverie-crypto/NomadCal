import { useState, useEffect } from "react";
import { C } from "../../utils/constants.js";

export default function Toast({ type = "info", title, body = "", duration = 4000, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const t = setTimeout(onClose, duration);
      return () => clearTimeout(t);
    }
  }, [duration, onClose]);

  const bg = type === "success" ? C.green : type === "error" ? C.red : C.accent;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${title}\n${body}`);
      setCopied(true);
      if (navigator.vibrate) navigator.vibrate(30);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div style={{
      position: "fixed", top: 12, left: 12, right: 12, zIndex: 9999,
      background: C.surface, border: `1.5px solid ${bg}`, borderRadius: 14,
      boxShadow: "0 8px 28px rgba(0,0,0,.18)", padding: "12px 14px",
      display: "flex", flexDirection: "column", gap: 8,
      animation: "toastIn .25s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: bg, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 800, color: bg, flex: 1 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
      </div>
      {body && (
        <pre style={{ margin: 0, fontSize: 10, color: C.ink, whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "ui-monospace, monospace", background: C.bg, padding: "6px 8px", borderRadius: 8, maxHeight: 120, overflow: "auto" }}>{body}</pre>
      )}
      {body && (
        <button onClick={copy} style={{ alignSelf: "flex-end", background: bg, color: "#fff", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
          {copied ? "✓ Copié" : "Copier"}
        </button>
      )}
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
