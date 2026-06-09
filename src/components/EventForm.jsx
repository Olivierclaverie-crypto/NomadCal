import { useState } from "react";
import { C, GRID_END, RECURRENCE_OPTIONS } from "../utils/constants.js";
import { todayISO, timeToMinutes, minutesToHHMM } from "../utils/helpers.js";

export default function EventForm({ initial, calendars, onSave, onCancel, defaultCalHref, saving=false }) {
  const [title,setTitle]       = useState(initial?.title||"");
  const initialParts = (initial?.title || "").split(" ");

const [prenom,setPrenom] =
  useState(initialParts.slice(0, -1).join(" ") || "");

const [nom,setNom] =
  useState(initialParts.slice(-1).join("") || "");
  const [allDay,setAllDay]     = useState(initial?.allDay||false);
 const defaultStart = initial?.startTime || "09:00";

// ── Durée par défaut user (future préférence Settings) ──
const DEFAULT_DURATION = 60;

const computedEnd =
  initial?.endTime ||
  minutesToHHMM(
    Math.min(
      GRID_END,
      timeToMinutes(defaultStart) + DEFAULT_DURATION
    )
  );

const [startDate,setSD] = useState(initial?.startDate || todayISO());
const [endDate,setED]   = useState(initial?.endDate || initial?.startDate || todayISO());

const [startTime,setST] = useState(defaultStart);
const [endTime,setET]   = useState(computedEnd);
  const [calHref,setCal]       = useState(initial?.calHref||defaultCalHref||calendars[0]?.href||"");
  // Champs ICS structurés
  const [rue,setRue]           = useState(initial?.rue||initial?.location||"");
  const [cp,setCp]             = useState(initial?.cp||"");
  const [ville,setVille]       = useState(initial?.ville||"");
  const [email,setEmail]       = useState(initial?.email||"");
  const [tel,setTel]           = useState(initial?.tel||"");
  const [notes,setNotes]       = useState(initial?.notes||"");
  const [rrule,setRrule]       = useState(initial?.rrule||"");
  const [editMode,setEditMode] = useState("this");
  const [status,setStatus]     = useState(initial?.status||"confirmed");

  const calColor = calendars.find(c=>c.href===calHref)?.color || C.accent;

  // Adresse composée (pour LOCATION ICS + bouton Plans)
  const composedLoc = [rue.trim(), [cp.trim(), ville.trim()].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const durMin = Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
  function applyDuration(mins){ setET(minutesToHHMM(Math.min(GRID_END, timeToMinutes(startTime)+mins))); }
  // S3 — fin impossible empêchée : déplacer le début garde la durée ; une fin ≤ début saute juste après
  function changeStart(v){ const dur=Math.max(15, timeToMinutes(endTime)-timeToMinutes(startTime)); setST(v); setET(minutesToHHMM(Math.min(GRID_END, timeToMinutes(v)+dur))); }
  function changeEnd(v){ const sMin=timeToMinutes(startTime); setET(timeToMinutes(v)<=sMin ? minutesToHHMM(Math.min(GRID_END, sMin+15)) : v); }

  // En-tête flottant : ✕ rouge / ✓ vert dès qu'un champ est rempli
  const hasContent = !!(title.trim()||rue.trim()||cp.trim()||ville.trim()||email.trim()||tel.trim()||notes.trim());

  function save() {
    if (!title.trim()) return;
    // Notes = notes libres + contact (composition pour DESCRIPTION ICS)
    const contactLines = [];
    if (email.trim()) contactLines.push("Email : " + email.trim());
    if (tel.trim())   contactLines.push("Tél : " + tel.trim());
    const fullNotes = [notes.trim(), ...contactLines].filter(Boolean).join("\n");
    onSave({
      title:title.trim(), allDay,
      startDate, startTime:allDay?null:startTime, endDate, endTime:allDay?null:endTime,
      calHref, location:composedLoc, notes:fullNotes, rrule, editMode, status,
      // champs structurés conservés en cache local
      rue, cp, ville, email, tel,
    });
  }

  const DURATIONS = [["15 min",15],["30 min",30],["45 min",45],["1 h",60],["2 h",120]];

  // --- Habillage : sections groupées ORCHARD ---
  const card   = {background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"};
  const secLbl = {fontSize:11,fontWeight:800,letterSpacing:.5,textTransform:"uppercase",color:C.muted,margin:"16px 4px 7px"};
  const cellIn = {width:"100%",padding:"13px 14px",border:"none",background:"transparent",color:C.ink,fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box"};
  const valIn  = {marginLeft:"auto",border:"none",background:"transparent",color:C.accent,fontSize:15,fontFamily:"inherit",fontWeight:600,outline:"none"};
  const rowR   = {display:"flex",alignItems:"center",padding:"11px 14px"};
  const div1   = {borderTop:`1px solid ${C.border}`};
  const avRow  = {display:"flex",alignItems:"center",gap:10,padding:"13px 14px",opacity:.5};
  const pill   = {marginLeft:"auto",fontSize:10,fontWeight:800,color:C.goldDark,background:C.goldLight,border:`1px solid ${C.gold}`,borderRadius:9,padding:"2px 8px"};
  const navBtn = {width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",border:"none",cursor:"pointer",padding:0};

  return (
    <div style={{position:"fixed",inset:0,zIndex:500,background:C.bg,display:"flex",flexDirection:"column"}}>

      {/* EN-TÊTE FLOTTANT ✕ / ✓ */}
      <div style={{
        flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"10px 14px",paddingTop:"calc(env(safe-area-inset-top, 0px) + 12px)",
        background:C.bg,borderBottom:`1px solid ${C.border}`,
      }}>
        <button onClick={onCancel} aria-label="Annuler" style={{...navBtn,background:hasContent?"#fbeae8":"transparent"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={hasContent?C.red:C.muted} strokeWidth="2.2" strokeLinecap="round"/></svg>
        </button>
        <span style={{fontSize:16,fontWeight:800,color:C.ink,letterSpacing:.3,fontFamily:"Phenomena, sans-serif"}}>{initial?"Modifier l'événement":"Nouvel événement"}</span>
        <button onClick={save} disabled={saving} aria-label="Enregistrer" style={{...navBtn,background:hasContent?"#e8f3ec":"transparent",opacity:saving?.5:1}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke={hasContent?C.green:C.muted} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* CORPS SCROLLABLE */}
      <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"4px 16px 40px"}}>
        <div style={{display:"flex",flexDirection:"column"}}>

          {/* CONTACT */}
          <div style={secLbl}>Contact</div>
       
<div style={card}>
  <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Nom du client…" style={{...cellIn,fontSize:17,fontWeight:700}}/>
</div>

{/* LIEU & COORDONNÉES */}

          <div style={secLbl}>Lieu &amp; coordonnées</div>
          <div style={card}>
            <div style={{position:"relative"}}>
              <input value={rue} onChange={e=>setRue(e.target.value)} placeholder="Rue" style={{...cellIn,paddingRight:44}}/>
              {composedLoc&&<button onClick={()=>{const a=encodeURIComponent(composedLoc);const w=confirm("OK = Plans Apple\nAnnuler = Waze/Google");if(w)window.open(`maps://?q=${a}`,"_blank");else{const g=confirm("OK = Waze\nAnnuler = Google Maps");if(g)window.open(`waze://?q=${a}&navigate=yes`,"_blank");else window.open(`https://maps.google.com/?q=${a}`,"_blank");}}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",padding:0,lineHeight:0}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" stroke={C.accent} strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="10" r="2.4" stroke={C.accent} strokeWidth="1.6"/></svg></button>}
            </div>
            <div style={{display:"flex",...div1}}>
              <input value={cp} onChange={e=>setCp(e.target.value)} placeholder="CP" inputMode="numeric" style={{...cellIn,flex:".5",borderRight:`1px solid ${C.border}`}}/>
              <input value={ville} onChange={e=>setVille(e.target.value)} placeholder="Ville" style={{...cellIn,flex:"1"}}/>
            </div>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" inputMode="email" style={{...cellIn,...div1}}/>
            <input value={tel} onChange={e=>setTel(e.target.value)} placeholder="Téléphone" inputMode="tel" style={{...cellIn,...div1}}/>
          </div>

          {/* QUAND */}
          <div style={secLbl}>Quand</div>
          <div style={card}>
            <div style={rowR}>
              <span style={{fontSize:15,color:C.ink}}>Journée entière</span>
              <div onClick={()=>setAllDay(a=>!a)} style={{marginLeft:"auto",width:46,height:28,borderRadius:14,background:allDay?C.green:C.border,cursor:"pointer",position:"relative",transition:"background .2s"}}>
                <div style={{position:"absolute",top:3,left:allDay?21:3,width:22,height:22,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
              </div>
            </div>
            {!allDay ? (
              <>
<div style={{...rowR,...div1}}>
  <span style={{fontSize:15,color:C.ink}}>Date</span>

  <button
    onClick={() => {
      const next = prompt("Date (AAAA-MM-JJ)", startDate);

      if (!next) return;

      setSD(next);
      setED(next);
    }}
    style={{
      marginLeft:"auto",
      border:"none",
      background:"transparent",
      color:C.accent,
      fontSize:15,
      fontFamily:"inherit",
      fontWeight:600,
      cursor:"pointer"
    }}
  >
    {startDate}
  </button>
</div>                <div style={{...rowR,...div1}}><span style={{fontSize:15,color:C.ink}}>Début</span><input type="time" value={startTime} onChange={e=>changeStart(e.target.value)} style={valIn}/></div>
                <div style={{...rowR,...div1}}><span style={{fontSize:15,color:C.ink}}>Fin</span><input type="time" value={endTime} min={startTime} onChange={e=>changeEnd(e.target.value)} style={valIn}/></div>
                <div style={{display:"flex",gap:6,padding:"10px 12px",...div1}}>
                  {DURATIONS.map(([lbl,mins])=>{const active=durMin===mins;return (<button key={mins} onClick={()=>applyDuration(mins)} style={{flex:1,padding:"7px 2px",borderRadius:9,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,border:`1.5px solid ${active?C.gold:C.border}`,background:active?C.goldLight:"transparent",color:active?C.goldDark:C.muted}}>{lbl}</button>);})}
                </div>
              </>
            ) : (
              <>
                <div style={{...rowR,...div1}}><span style={{fontSize:15,color:C.ink}}>Du</span><input type="date" value={startDate} onChange={e=>setSD(e.target.value)} style={valIn}/></div>
                <div style={{...rowR,...div1}}><span style={{fontSize:15,color:C.ink}}>Au</span><input type="date" value={endDate} onChange={e=>setED(e.target.value)} style={valIn}/></div>
              </>
            )}
          </div>

          {/* CLASSEMENT */}
          <div style={secLbl}>Classement</div>
          <div style={card}>
            <div style={{display:"flex",alignItems:"center",padding:"8px 12px"}}>
              <span style={{fontSize:15,color:C.ink}}>Calendrier</span>
              <select value={calHref} onChange={e=>setCal(e.target.value)} style={{marginLeft:"auto",border:`1.5px solid ${calColor}`,background:calColor+"15",borderRadius:9,padding:"7px 10px",color:C.ink,fontSize:14,fontFamily:"inherit",fontWeight:600,outline:"none",maxWidth:190}}>
                {calendars.map(c=><option key={c.href} value={c.href}>{c.displayName}</option>)}
              </select>
            </div>
            <div style={{display:"flex",gap:8,padding:"10px 12px",...div1}}>
              <button onClick={()=>setStatus("confirmed")} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${status==="confirmed"?C.green:C.border}`,background:status==="confirmed"?C.greenLight:"transparent",color:status==="confirmed"?C.green:C.muted,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={status==="confirmed"?C.green:C.muted} strokeWidth="1.7"/><path d="M8 12.5l2.5 2.5L16 9" stroke={status==="confirmed"?C.green:C.muted} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>Confirmé</button>
              <button onClick={()=>setStatus("tentative")} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${status==="tentative"?"#E07B17":C.border}`,background:status==="tentative"?"#FFF4E6":"transparent",color:status==="tentative"?"#B8741A":C.muted,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={status==="tentative"?"#E07B17":C.muted} strokeWidth="1.7"/><path d="M12 7v5l3.3 2" stroke={status==="tentative"?"#E07B17":C.muted} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>À confirmer</button>
            </div>
          </div>

          {/* RÉCURRENCE */}
          <div style={secLbl}>Récurrence</div>
          <div style={card}>
            <div style={{display:"flex",alignItems:"center",padding:"8px 12px"}}>
              <span style={{fontSize:15,color:C.ink}}>Répéter</span>
              <select value={rrule} onChange={e=>setRrule(e.target.value)} style={{marginLeft:"auto",border:`1.5px solid ${C.border}`,background:C.bg,borderRadius:9,padding:"7px 10px",color:C.ink,fontSize:14,fontFamily:"inherit",outline:"none",maxWidth:200}}>
                {RECURRENCE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {initial?.rrule&&<div style={{display:"flex",gap:6,padding:"10px 12px",...div1}}>
              {[["this","Cet événement"],["following","Suivants"],["all","Tous"]].map(([v,l])=>(
                <button key={v} onClick={()=>setEditMode(v)} style={{flex:1,padding:"8px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${editMode===v?C.accent:C.border}`,background:editMode===v?C.accentLight:"transparent",color:editMode===v?C.accent:C.muted,fontSize:11,fontWeight:700}}>{l}</button>
              ))}
            </div>}
          </div>

          {/* OPTIONS (à venir) */}
          <div style={secLbl}>Options</div>
          <div style={card}>
            <div style={avRow}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke={C.muted} strokeWidth="1.6" strokeLinejoin="round"/><path d="M10 20a2 2 0 004 0" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round"/></svg><span style={{fontSize:15,color:C.ink}}>Alerte</span><span style={pill}>à venir</span></div>
            <div style={{...avRow,...div1}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke={C.muted} strokeWidth="1.6"/><path d="M3.6 6.5l8.4 6 8.4-6" stroke={C.muted} strokeWidth="1.6" strokeLinejoin="round"/></svg><span style={{fontSize:15,color:C.ink}}>e.mail Invitation</span><span style={pill}>à venir</span></div>
            <div style={{...avRow,...div1}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="13" height="12" rx="2" stroke={C.muted} strokeWidth="1.6"/><path d="M16 10l5-3v10l-5-3z" stroke={C.muted} strokeWidth="1.6" strokeLinejoin="round"/></svg><span style={{fontSize:15,color:C.ink}}>Lien visio</span><span style={pill}>à venir</span></div>
            <div style={{...avRow,...div1}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M19 11l-7.5 7.5a4 4 0 01-5.7-5.7L13 5.6a2.7 2.7 0 013.8 3.8L9.3 17" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:15,color:C.ink}}>Pièce jointe</span><span style={pill}>à venir</span></div>
            <div style={{...avRow,...div1}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15V4M8.5 7L12 3.5 15.5 7M5 13v6h14v-6" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{fontSize:15,color:C.ink}}>Partager</span><span style={pill}>à venir</span></div>
          </div>

          {/* NOTES */}
          <div style={secLbl}>Notes</div>
          <div style={card}>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optionnel)" rows={3} style={{...cellIn,resize:"none",lineHeight:1.6}}/>
          </div>

        </div>
      </div>
    </div>
  );
}
