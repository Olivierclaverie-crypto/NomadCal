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
  { id:"bug",         label:"Bug",       color:C.red,    bg:C.redLight,
    icon:(c)=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="8" height="10" rx="4" stroke={c} strokeWidth="1.6"/><path d="M9 5l1.5 2M15 5l-1.5 2M8 11H4M16 11h4M8 15H4M16 15h4M8 18l-2 2M16 18l2 2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/></svg>) },
  { id:"idee",        label:"Idée",      color:C.accent, bg:C.accentLight,
    icon:(c)=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 17h6M10 20h4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.4.9 1 .9 1.6v.5h5.2v-.5c0-.6.3-1.2.9-1.6A6 6 0 0012 3z" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/></svg>) },
  { id:"super",       label:"Super !",   color:C.green,  bg:C.greenLight,
    icon:(c)=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 11v8H4v-8h3zM7 11l4-7c1.2 0 2 .9 2 2v3h4.5a2 2 0 012 2.3l-1 5a2 2 0 01-2 1.7H7" stroke={c} strokeWidth="1.6" strokeLinejoin="round"/></svg>) },
  { id:"frustration", label:"Frustrant", color:C.amber,  bg:C.amberLight,
    icon:(c)=>(<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.6"/><path d="M8 15.5c1-1.2 2.3-1.8 4-1.8s3 .6 4 1.8" stroke={c} strokeWidth="1.6" strokeLinecap="round"/><path d="M8.5 9.5l1.8.9M15.5 9.5l-1.8.9" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>) },
];

export default function FeedbackButton({ auth, currentPage = "NomadCal" }) {
  const [open, setOpen]       = useState(false);
  const [type, setType]       = useState("idee");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  // Visible uniquement pour les beta users
  if (!auth?.email || !BETA_EMAILS.includes(auth.email)) return null;

  function sendFeedback() {
    if (!message.trim()) return;
    const t = FEEDBACK_TYPES.find(x => x.id === type);
    const subject = `[NomadCal] ${t ? t.label : type} — ${currentPage}`;
    const body =
      `${message.trim()}\n\n` +
      `— — — — —\n` +
      `Type : ${t ? t.label : type}\n` +
      `Page : ${currentPage}\n` +
      `Utilisateur : ${auth?.email || "?"}\n` +
      `Version : v1-beta`;
// stockage local au lieu d’envoyer direct
const existing = JSON.parse(localStorage.getItem("nomad_feedback") || "[]");

const newFeedback = {
  // 💬 contenu
  text: message.trim(),

  // 🧠 type
  type,

  // 📍 contexte
  page: currentPage,
  location: currentPage,

  // 👤 user
  user: auth?.email || "?",

  // 🌐 environnement
  network: navigator.onLine ? "online" : "offline",
  userAgent: navigator.userAgent,

  // ⏰ temps
  date: new Date().toISOString(),
  dateReadable: new Date().toLocaleString(),

  // 🔧 app
  appVersion: "v1-beta",

  // 🆔 identifiant unique
  id: Date.now()
};

localStorage.setItem(
  "nomad_feedback",
  JSON.stringify([...existing, newFeedback])
);

alert("Feedback enregistré ✅");

    setSent(true);
    setTimeout(() => {
      setSent(false);
      setOpen(false);
      setMessage("");
      setType("idee");
    }, 2000);
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
              <div style={{ marginBottom:10, display:"flex", justifyContent:"center" }}>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={C.green} strokeWidth="1.6"/><path d="M8 12.5l2.5 2.5L16 9" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div style={{ fontWeight:700, color:C.green, fontSize:15 }}>Merci pour votre aide</div>
              <div style={{ fontSize:12, color:C.muted, marginTop:6, lineHeight:1.5 }}>NomadCal traite vos informations au plus vite</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize:15, fontWeight:700, color:C.ink, marginBottom:14, display:"flex", alignItems:"center", gap:7 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 3z" stroke={C.accent} strokeWidth="1.6" strokeLinejoin="round"/></svg>
                Feedback Beta
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
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                  }}>
                    {t.icon(type===t.id ? t.color : C.muted)}{t.label}
                  </button>
                ))}
              </div>

              {/* Page */}
              <div style={{ fontSize:11, color:C.muted, marginBottom:6, display:"flex", alignItems:"center", gap:5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" stroke={C.muted} strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.4" stroke={C.muted} strokeWidth="1.6"/></svg>
                Page : <strong style={{color:C.accent}}>{currentPage}</strong>
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
                <button onClick={sendFeedback} disabled={!message.trim()} style={{
                  flex:2, padding:"10px", borderRadius:10,
                  border:"none", background: message.trim() ? C.accent : C.border,
                  color:"#fff", cursor: message.trim() ? "pointer" : "not-allowed",
                  fontFamily:"inherit", fontSize:13, fontWeight:700,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                }}>
                  Envoyer
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12l16-7-7 16-2.5-6.5L4 12z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/></svg>
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
        {open
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
          : <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 5h16v11H8l-4 3z" stroke={C.accent} strokeWidth="1.8" strokeLinejoin="round"/></svg>}
      </button>
    </>
  );
}
