// src/components/FeedbackButton.jsx
// Bouton feedback flottant — Beta users uniquement
// Bloc de code séparé et indépendant — évoluera facilement

import { useState } from "react";

const C = {
  accent:"#2B5A9E", accentLight:"#eaf1fb", accentBorder:"#BAD6F0",
  ink:"#0F1D2B", muted:"#5a6e7f", surface:"#ffffff",
  border:"#e8d9c0", bg:"#fdf8f0",
  green:"#2d7a4f", greenLight:"#edf7f1",
  red:"#c0392b", redLight:"#fdf0ef",
  amber:"#8B5E20", amberLight:"#fdf3e3",
  gold:"#F5C97A",
};

// ── Beta users autorisés ──────────────────────────────────────────────────────
const BETA_EMAILS = [
  "olivierclaverie@me.com",
  // Ajouter les emails famille ici
];

const FEEDBACK_TYPES = [
  { id:"bug",         emoji:"🐛", label:"Bug",        color:C.red,   bg:C.redLight },
  { id:"idee",        emoji:"💡", label:"Idée",       color:C.accent,bg:C.accentLight },
  { id:"super",       emoji:"👍", label:"Super !",    color:C.green, bg:C.greenLight },
  { id:"frustration", emoji:"😤", label:"Frustrant",  color:C.amber, bg:C.amberLight },
];

export default function FeedbackButton({ auth, currentPage = "NomadCal" }) {
  const [open, setOpen]       = useState(false);
  const [type, setType]       = useState("idee");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  // Visible uniquement pour les beta users
  if (!auth?.email || !BETA_EMAILS.includes(auth.email)) return null;

  async function sendFeedback() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user:       auth.email,
          page:       currentPage,
          type,
          message:    message.trim(),
          appVersion: "v1-beta",
        }),
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setOpen(false);
        setMessage("");
        setType("idee");
      }, 2000);
    } catch {
      // Silencieux
    }
    setSending(false);
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position:"fixed", inset:0, zIndex:498, background:"rgba(0,0,0,.3)", backdropFilter:"blur(2px)" }}
        />
      )}

      {/* Panel feedback */}
      {open && (
        <div style={{
          position:"fixed", bottom:130, right:16, zIndex:499,
          background:C.surface, border:`1.5px solid ${C.border}`,
          borderRadius:20, padding:20, width:300,
          boxShadow:"0 8px 32px rgba(0,0,0,.18)",
        }}>
          {sent ? (
            <div style={{ textAlign:"center", padding:"20px 0" }}>
              <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
              <div style={{ fontWeight:700, color:C.green, fontSize:15 }}>Merci Olivier !</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>Feedback envoyé</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:14 }}>
                💬 Feedback Beta
              </div>

              {/* Type */}
              <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
                {FEEDBACK_TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    flex:1, minWidth:60, padding:"7px 4px",
                    border:`1.5px solid ${type===t.id?t.color:C.border}`,
                    background: type===t.id ? t.bg : "transparent",
                    borderRadius:10, cursor:"pointer",
                    fontFamily:"inherit", fontSize:11, fontWeight:700,
                    color: type===t.id ? t.color : C.muted,
                    textAlign:"center",
                  }}>
                    {t.emoji}<br/>{t.label}
                  </button>
                ))}
              </div>

              {/* Page */}
              <div style={{ fontSize:11, color:C.muted, marginBottom:6 }}>
                📍 Page : <strong style={{color:C.accent}}>{currentPage}</strong>
              </div>

              {/* Message */}
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Décris ton retour terrain…"
                rows={3}
                autoFocus
                style={{
                  width:"100%", padding:"10px 12px",
                  border:`1.5px solid ${C.border}`,
                  borderRadius:10, background:C.bg,
                  color:C.ink, fontSize:13,
                  fontFamily:"inherit", outline:"none",
                  resize:"none", boxSizing:"border-box",
                  lineHeight:1.6, marginBottom:12,
                }}
              />

              {/* Boutons */}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => setOpen(false)} style={{
                  flex:1, padding:"10px", borderRadius:10,
                  border:`1px solid ${C.border}`, background:"transparent",
                  color:C.muted, cursor:"pointer", fontFamily:"inherit",
                  fontSize:13, fontWeight:600,
                }}>Annuler</button>
                <button onClick={sendFeedback} disabled={!message.trim() || sending} style={{
                  flex:2, padding:"10px", borderRadius:10,
                  border:"none", background: message.trim() ? C.accent : C.border,
                  color:"#fff", cursor: message.trim() ? "pointer" : "not-allowed",
                  fontFamily:"inherit", fontSize:13, fontWeight:700,
                  opacity: sending ? .7 : 1,
                }}>
                  {sending ? "Envoi…" : "Envoyer 🚀"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position:"fixed", bottom:125, right:16, zIndex:497,
          width:44, height:44, borderRadius:"50%",
          background: open ? C.accent : C.surface,
          border:`2px solid ${C.accent}`,
          boxShadow:"0 4px 16px rgba(43,90,158,.3)",
          cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center",
          fontSize:20, transition:"all .2s",
        }}
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
