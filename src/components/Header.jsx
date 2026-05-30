import { useState } from "react";
import { C } from '../utils/constants.js';

export default function Header({
  weekDays,
  syncing,
  syncOk,
  onSync,
  onSettings,
  onAddEvent,
  clipboard,
  onClearClipboard,
  tasks,
  onToggleDrawer,
  weekStart,
  onToday,
  onGoToDate,
  onChangeView,
  onOpenFrais,
  currentView,
  fmtWeekRange,
  fmtDay,
  fmtDayNum,
  weekNum,
  today,
}) {
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickDay, setPickDay] = useState(String(new Date().getDate()).padStart(2,"0"));
  const [pickMonth, setPickMonth] = useState(String(new Date().getMonth()+1).padStart(2,"0"));
  const [pickYear, setPickYear] = useState(String(new Date().getFullYear()));

  const views = [
    { key:"day",   label:"Jour" },
    { key:"week",  label:"Semaine" },
    { key:"month", label:"Mois" },
    { key:"year",  label:"Année" },
  ];

  function handleGoToDate() {
    const iso = `${pickYear}-${pickMonth.padStart(2,"0")}-${pickDay.padStart(2,"0")}`;
    const d = new Date(iso + "T12:00:00");
    if (!isNaN(d)) { onGoToDate(d); setShowDatePicker(false); }
  }

  const btnStyle = {
    fontSize: 11, fontWeight: 700,
    border: `1px solid ${C.accentBorder}`,
    borderRadius: 8, padding: "4px 8px",
    cursor: "pointer", fontFamily: "inherit",
    background: C.accentLight, color: C.accent,
    whiteSpace: "nowrap",
  };

  const btnPrimary = {
    ...btnStyle,
    background: C.accent, color: "#fff", border: "none",
  };

  const inputNum = {
    width: 40, textAlign: "center",
    padding: "6px 4px", borderRadius: 8,
    border: `1.5px solid ${C.border}`,
    background: C.bg, color: C.ink,
    fontSize: 15, fontFamily: "Phenomena, sans-serif",
    fontWeight: 700, outline: "none",
  };

  return (
    <div style={{
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      flexShrink: 0,
      position: "relative",
    }}>

      {/* ── Ligne 1 — NomadCal grand à gauche ── */}
      <div style={{ padding: "10px 14px 4px" }}>
        <span style={{
          fontSize: 30, fontWeight: 800,
          color: C.accent,
          fontFamily: "Phenomena, sans-serif",
          letterSpacing: -1,
          lineHeight: 1,
        }}>NomadCal</span>
      </div>

      {/* Bandeau clipboard */}
      {clipboard ? (
        <div style={{
          display:"flex", alignItems:"center", gap:8,
          background: C.goldLight, border:`1px solid ${C.gold}`,
          borderRadius:10, margin:"0 14px 8px", padding:"8px 12px",
        }}>
          <span style={{ fontSize:12, color:C.goldDark, flex:1, fontWeight:700 }}>
            📋 {clipboard.title} — Tap sur un créneau pour coller
          </span>
          <button onClick={onClearClipboard} style={{
            background:"none", border:"none",
            color:C.goldDark, cursor:"pointer", fontSize:16, padding:"0 4px", fontWeight:700,
          }}>✕</button>
        </div>
      ) : (<>

        {/* ── Ligne 2 — Sem XX à gauche | ↻ ⚙️ à droite ── */}
        <div style={{
          display:"flex", alignItems:"center",
          justifyContent:"space-between",
          padding:"0 14px 2px",
        }}>
          <span style={{ fontSize:15, color:C.ink, fontWeight:700, fontFamily:"Phenomena, sans-serif" }}>
            Sem. {weekNum}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ position:"relative", display:"inline-flex" }}>
              <button onClick={onSync} style={{
                background:"none", border:"none",
                color: C.muted, cursor:"pointer", fontSize:20, padding:2, lineHeight:1,
              }}>↻</button>
              <div style={{
                position:"absolute", top:"50%", left:"50%",
                transform:"translate(-50%,-50%)",
                width:6, height:6, borderRadius:"50%",
                background: syncing ? C.gold : syncOk ? C.green : C.red,
                transition:"background .3s", pointerEvents:"none",
              }}/>
            </div>
            <button onClick={onSettings} style={{
              background:"none", border:"none",
              color: C.muted, cursor:"pointer", fontSize:20, padding:2,
            }}>⚙️</button>
          </div>
        </div>

        {/* ── Ligne 3 — Mai 2026 à gauche | 4 boutons à droite ── */}
        <div style={{
          display:"flex", alignItems:"center",
          justifyContent:"space-between",
          padding:"0 14px 8px",
          gap:6,
        }}>
          <span style={{ fontSize:15, color:C.muted, fontWeight:600, whiteSpace:"nowrap" }}>
            {fmtWeekRange(weekDays)}
          </span>
          <div style={{ display:"flex", gap:5, flexShrink:0 }}>
            <button onClick={()=>setShowDatePicker(v=>!v)} style={btnStyle}>Aller</button>
            <div style={{ position:"relative" }}>
              <button onClick={()=>setShowViewMenu(v=>!v)} style={btnStyle}>Vues ▾</button>
              {showViewMenu && (
                <div style={{
                  position:"absolute", top:"calc(100% + 6px)", right:0,
                  background: C.surface, border:`1px solid ${C.border}`,
                  borderRadius:10, overflow:"hidden",
                  boxShadow:"0 4px 16px rgba(0,0,0,.12)",
                  zIndex:500, minWidth:110,
                }}>
                  {views.map(v=>(
                    <button key={v.key} onClick={()=>{ onChangeView(v.key); setShowViewMenu(false); }}
                      style={{
                        display:"block", width:"100%",
                        padding:"10px 14px", textAlign:"left",
                        background: currentView===v.key ? C.accentLight : "transparent",
                        color: currentView===v.key ? C.accent : C.ink,
                        border:"none", borderBottom:`0.5px solid ${C.border}`,
                        fontSize:13, fontWeight: currentView===v.key ? 700 : 500,
                        cursor:"pointer", fontFamily:"inherit",
                      }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onToday} style={btnStyle}>Auj.</button>
            <button onClick={onAddEvent} style={btnPrimary}>+RDV</button>
          </div>
        </div>

        {/* ── Ligne 4 — Jours + numéros + € cerclé bleu ── */}
        <div style={{
          display:"flex",
          borderTop:`0.5px solid ${C.border}`,
        }}>
          {weekDays.map(day=>{
            const isToday = day === today;
            return(
              <div key={day} style={{
                flex:1, textAlign:"center",
                padding:"4px 0 6px",
              }}>
                {/* Nom jour */}
                <div style={{
                  fontSize:10, fontWeight:700,
                  color: isToday ? C.accent : C.muted,
                  textTransform:"uppercase", letterSpacing:.5,
                  marginBottom:2,
                }}>
                  {fmtDay(day)}
                </div>
                {/* Numéro jour */}
                <div style={{
                  width:24, height:24, borderRadius:"50%",
                  background: isToday ? C.accent : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  margin:"0 auto 4px",
                }}>
                  <span style={{
                    fontSize:13, fontWeight:700,
                    color: isToday ? "#fff" : C.ink,
                  }}>{fmtDayNum(day)}</span>
                </div>
                {/* € cerclé bleu — accès frais du jour */}
                <div
                  onClick={()=>onOpenFrais&&onOpenFrais(day)}
                  style={{
                    width:20, height:20, borderRadius:"50%",
                    background: C.accent,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    margin:"0 auto",
                    cursor:"pointer",
                    fontSize:10, fontWeight:800, color:"#fff",
                    boxShadow:`0 1px 4px ${C.accent}66`,
                  }}>
                  €
                </div>
              </div>
            );
          })}
        </div>

      </>)}

      {/* ── Mini modal date picker ── */}
      {showDatePicker && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:"50%",
          transform:"translateX(-50%)",
          background: C.surface, border:`1px solid ${C.border}`,
          borderRadius:14, padding:"14px 18px",
          boxShadow:"0 8px 24px rgba(0,0,0,.15)",
          zIndex:500, display:"flex", flexDirection:"column",
          alignItems:"center", gap:10,
        }}>
          <div style={{ fontSize:11, color:C.muted, fontWeight:700, letterSpacing:.5 }}>ALLER À</div>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <input value={pickDay} onChange={e=>setPickDay(e.target.value)}
              placeholder="JJ" maxLength={2} style={inputNum}/>
            <span style={{ color:C.muted, fontWeight:700 }}>/</span>
            <input value={pickMonth} onChange={e=>setPickMonth(e.target.value)}
              placeholder="MM" maxLength={2} style={inputNum}/>
            <span style={{ color:C.muted, fontWeight:700 }}>/</span>
            <input value={pickYear} onChange={e=>setPickYear(e.target.value)}
              placeholder="AAAA" maxLength={4} style={{...inputNum, width:54}}/>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setShowDatePicker(false)} style={{...btnStyle,fontSize:12}}>Annuler</button>
            <button onClick={handleGoToDate} style={{...btnPrimary,fontSize:12}}>Aller ✓</button>
          </div>
        </div>
      )}

    </div>
  );
}
