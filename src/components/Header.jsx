import { useState, useEffect } from "react";
import { C } from '../utils/constants.js';

const IconSync = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
    <path d="M4 10a6 6 0 016-6 6 6 0 014.2 1.8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 10a6 6 0 01-10.2 4.2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 4l.2 3.8-3.8-.2" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#5a6e7f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Header({
  weekDays, syncing, syncOk, onSync, onSettings, onAddEvent,
  clipboard, onClearClipboard, onToday, onGoToDate, onChangeView,
  onOpenFrais, currentView, fmtWeekRange, fmtDay, fmtDayNum, weekNum, today,
}) {
  const [showViewMenu,   setShowViewMenu]   = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const DAYS   = Array.from({length:31}, (_,i) => String(i+1).padStart(2,"0"));
  const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const YEARS  = Array.from({length:10}, (_,i) => String(new Date().getFullYear()-2+i));
  const [pickDayIdx,   setPickDayIdx]   = useState(new Date().getDate()-1);
  const [pickMonthIdx, setPickMonthIdx] = useState(new Date().getMonth());
  const [pickYearIdx,  setPickYearIdx]  = useState(2);

  const views = [
    { key:"day",   label:"Jour" },
    { key:"week",  label:"Semaine" },
    { key:"month", label:"Mois" },
    { key:"year",  label:"Année" },
  ];

  function handleGoToDate() {
    const iso = `${YEARS[pickYearIdx]}-${String(pickMonthIdx+1).padStart(2,"0")}-${DAYS[pickDayIdx]}`;
    const d = new Date(iso + "T12:00:00");
    if (!isNaN(d)) { onGoToDate(d); setShowDatePicker(false); }
  }

  useEffect(()=>{
    if (!showViewMenu && !showDatePicker) return;
    function handle(e){ if (!e.target.closest("[data-menu]")){ setShowViewMenu(false); setShowDatePicker(false); } }
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return()=>{ document.removeEventListener("mousedown", handle); document.removeEventListener("touchstart", handle); };
  },[showViewMenu, showDatePicker]);

  // 4 boutons même taille fixe
  const btnBase = {
    fontSize: 13, fontWeight: 700,
    borderRadius: 9, padding: "7px 4px",
    cursor: "pointer", fontFamily: "inherit",
    whiteSpace: "nowrap", flex: 1,
    textAlign: "center", width: "100%",
    boxSizing: "border-box",
  };
  const btnStyle   = { ...btnBase, border:`1px solid ${C.accentBorder}`, background:C.accentLight, color:C.accent };
  const btnPrimary = { ...btnBase, background:C.accent, color:"#fff", border:"none" };

  function WheelPicker({ items, selectedIdx, onChange }) {
    const ITEM_H = 40;
    let startY = null, startIdx = null;
    function clamp(v){ return Math.max(0, Math.min(items.length-1, v)); }
    return (
      <div
        onTouchStart={e=>{ startY=e.touches[0].clientY; startIdx=selectedIdx; }}
        onTouchMove={e=>{ const dy=startY-e.touches[0].clientY; onChange(clamp(startIdx+Math.round(dy/ITEM_H))); }}
        style={{ position:"relative", height:ITEM_H*5, overflow:"hidden", width:"100%", cursor:"ns-resize", userSelect:"none" }}>
        <div style={{ position:"absolute", top:ITEM_H*2, left:0, right:0, height:ITEM_H, borderTop:`1.5px solid ${C.border}`, borderBottom:`1.5px solid ${C.border}`, pointerEvents:"none", zIndex:2, background:`${C.accentLight}88` }}/>
        <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:3, background:`linear-gradient(to bottom, ${C.surface} 0%, transparent 35%, transparent 65%, ${C.surface} 100%)` }}/>
        <div style={{ transform:`translateY(${(2-selectedIdx)*ITEM_H}px)`, transition:"transform .15s ease-out" }}>
          {items.map((item,i)=>(
            <div key={i} onClick={()=>onChange(i)} style={{ height:ITEM_H, display:"flex", alignItems:"center", justifyContent:"center", fontSize:i===selectedIdx?18:15, fontWeight:i===selectedIdx?700:400, color:i===selectedIdx?C.ink:C.muted, fontFamily:"Phenomena, sans-serif", cursor:"pointer" }}>{item}</div>
          ))}
        </div>
      </div>
    );
  }

  const syncColor = syncing ? C.gold : syncOk ? C.green : C.red;

  return (
    <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, flexShrink:0, position:"relative" }}>

      {(showViewMenu||showDatePicker) && (
        <div onClick={()=>{ setShowViewMenu(false); setShowDatePicker(false); }}
          style={{ position:"fixed", inset:0, zIndex:498, background:"transparent" }}/>
      )}

      {/* ── Ligne 1 — NomadCal + ↻ + ⚙️ ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px 4px" }}>
        <span style={{ fontSize:34, fontWeight:800, color:C.accent, fontFamily:"Phenomena, sans-serif", letterSpacing:-1, lineHeight:1 }}>NomadCal</span>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ position:"relative", display:"inline-flex" }}>
            <button onClick={onSync} style={{ background:"none", border:"none", cursor:"pointer", padding:2, lineHeight:1, display:"flex" }}>
              <IconSync color={C.muted}/>
            </button>
            <div style={{ position:"absolute", top:-2, right:-2, width:8, height:8, borderRadius:"50%", background:syncColor, border:`2px solid ${C.surface}`, pointerEvents:"none" }}/>
          </div>
          <button onClick={onSettings} style={{ background:"none", border:"none", cursor:"pointer", padding:2, display:"flex" }}>
            <IconSettings/>
          </button>
        </div>
      </div>

      {clipboard ? (
        <div style={{ display:"flex", alignItems:"center", gap:8, background:C.goldLight, border:`1px solid ${C.gold}`, borderRadius:10, margin:"0 14px 8px", padding:"8px 12px" }}>
          <span style={{ fontSize:12, color:C.goldDark, flex:1, fontWeight:700 }}>📋 {clipboard.title} — Tap sur un créneau pour coller</span>
          <button onClick={onClearClipboard} style={{ background:"none", border:"none", color:C.goldDark, cursor:"pointer", fontSize:16, padding:"0 4px", fontWeight:700 }}>✕</button>
        </div>
      ) : (<>

        {/* ── Ligne 2 — Sem XX | Mois Année ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 14px 6px" }}>
          <span style={{ fontSize:15, color:C.ink, fontWeight:700, fontFamily:"Phenomena, sans-serif" }}>Sem. {weekNum}</span>
          <span style={{ fontSize:15, color:C.muted, fontWeight:600 }}>{fmtWeekRange(weekDays)}</span>
        </div>

        {/* ── Ligne 3 — 4 boutons même taille ── */}
        <div style={{ display:"flex", gap:6, padding:"0 14px 8px" }}>

          {/* Aller */}
          <div style={{ position:"relative", flex:1 }} data-menu>
            <button onClick={()=>{ setShowDatePicker(v=>!v); setShowViewMenu(false); }} style={btnStyle}>Aller</button>
            {showDatePicker && (
              <div data-menu style={{ position:"fixed", top:"auto", left:14, right:14, background:C.surface, border:`1px solid ${C.border}`, borderRadius:20, padding:"16px", boxShadow:"0 8px 32px rgba(0,0,0,.18)", zIndex:499 }}>
                <div style={{ fontSize:12, color:C.muted, fontWeight:700, letterSpacing:.5, textAlign:"center", marginBottom:10 }}>ALLER À UNE DATE</div>
                <div style={{ display:"flex", gap:4, marginBottom:10 }}>
                  <div style={{ flex:.8 }}><WheelPicker items={DAYS}   selectedIdx={pickDayIdx}   onChange={setPickDayIdx}/></div>
                  <div style={{ flex:1.4 }}><WheelPicker items={MONTHS} selectedIdx={pickMonthIdx} onChange={setPickMonthIdx}/></div>
                  <div style={{ flex:1 }}><WheelPicker items={YEARS}  selectedIdx={pickYearIdx}  onChange={setPickYearIdx}/></div>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:8 }}>
                  <button onClick={()=>setShowDatePicker(false)} style={{...btnStyle,flex:1}}>Annuler</button>
                  <button onClick={handleGoToDate} style={{...btnPrimary,flex:1}}>Aller ✓</button>
                </div>
                <button onClick={()=>{ onGoToDate(new Date()); setShowDatePicker(false); }} style={{ width:"100%", background:"none", border:"none", color:C.accent, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  Aujourd'hui
                </button>
              </div>
            )}
          </div>

          {/* Vues — sans flèche */}
          <div style={{ position:"relative", flex:1 }} data-menu>
            <button onClick={()=>{ setShowViewMenu(v=>!v); setShowDatePicker(false); }} style={btnStyle}>Vues</button>
            {showViewMenu && (
              <div data-menu style={{ position:"absolute", top:"calc(100% + 6px)", left:0, background:C.surface, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden", boxShadow:"0 6px 24px rgba(0,0,0,.15)", zIndex:499, minWidth:150 }}>
                {views.map(v=>(
                  <button key={v.key} onClick={()=>{ onChangeView(v.key); setShowViewMenu(false); }}
                    style={{ display:"block", width:"100%", padding:"14px 18px", textAlign:"left", background:currentView===v.key?C.accentLight:"transparent", color:currentView===v.key?C.accent:C.ink, border:"none", borderBottom:`0.5px solid ${C.border}`, fontSize:15, fontWeight:currentView===v.key?700:500, cursor:"pointer", fontFamily:"inherit" }}>
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={onToday} style={btnStyle}>Aujourd'hui</button>
          <button onClick={onAddEvent} style={btnPrimary}>+RDV</button>
        </div>

        {/* ── Ligne 4 — Jours + numéros + € CSS ── */}
        <div style={{ display:"flex", borderTop:`0.5px solid ${C.border}` }}>
          {weekDays.map(day=>{
            const isToday = day === today;
            return(
              <div key={day} style={{ flex:1, textAlign:"center", padding:"4px 0 6px" }}>
                <div style={{ fontSize:10, fontWeight:700, color:isToday?C.accent:C.muted, textTransform:"uppercase", letterSpacing:.5, marginBottom:2 }}>
                  {fmtDay(day)}
                </div>
                <div style={{ width:24, height:24, borderRadius:"50%", background:isToday?C.accent:"transparent", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 4px" }}>
                  <span style={{ fontSize:13, fontWeight:700, color:isToday?"#fff":C.ink }}>{fmtDayNum(day)}</span>
                </div>
                {/* € CSS pur — cercle bleu clair, filet bleu acier, € bleu foncé */}
                <div
                  onClick={()=>onOpenFrais&&onOpenFrais(day)}
                  style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: C.accentLight,
                    border: `1.5px solid ${C.accent}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto", cursor: "pointer",
                    fontSize: 11, fontWeight: 800, color: C.accent,
                    fontFamily: "Phenomena, sans-serif",
                    boxShadow: `0 1px 3px ${C.accent}33`,
                  }}>
                  €
                </div>
              </div>
            );
          })}
        </div>

      </>)}
    </div>
  );
}
