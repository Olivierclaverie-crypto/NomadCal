import { useState, useRef } from "react";
import { C, PRIORITY } from '../utils/constants.js';
import { FeedIcon } from "./icons";

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const IconNotes = ({ active=false }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="4" y="3" width="12" height="14" rx="1.5" stroke={active?"#fff":"currentColor"} strokeWidth="1.5"/>
    <path d="M7 7h6M7 10h6M7 13h4" stroke={active?"#fff":"currentColor"} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 13l3 3" stroke={active?"rgba(255,255,255,0.6)":"#F5C97A"} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconTaches = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="15" cy="5" r="3" fill="#F5C97A"/>
    <path d="M14 5h2M15 4v2" stroke="#0F1D2B" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const IconSuppr = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
    <path d="M5 7h10M8 7V5h4v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="6" y="7" width="8" height="10" rx="1" stroke="#fff" strokeWidth="1.5"/>
    <path d="M9 10v4M11 10v4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function NomadTask({
  tasks,
  drawerOpen,
  setDrawerOpen,
  swipeTaskId,
  setSwipeTaskId,
  onTaskClick,
  onTaskDone,
  onTaskDelete,
  onAddTask,
  onOpenNomadBook,
  noteCount=0,
  onOpenNomadFeed,
}) {
  const [activeTab, setActiveTab] = useState(null);
  const PRIORITY_ORDER = { high:0, normal:1, low:2 };
  const openTasks = tasks.filter(t => !t.done).sort((a,b) => {
    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    return (PRIORITY_ORDER[a.priority||"normal"]) - (PRIORITY_ORDER[b.priority||"normal"]);
  });

  const MESSAGES = {
    notes: "NomadBook — Carnet de route terrain",
    tasks: `${openTasks.length} todo${openTasks.length > 1 ? "s" : ""} en cours`,
  };

  function vibrate(ms = 10) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  function handleTabTap(tab) {
    if (activeTab === tab) {
      if (tab === "notes") {
        onOpenNomadBook && onOpenNomadBook();
        vibrate(10);
      } else if (tab === "tasks") {
        setSwipeTaskId(null);
        setDrawerOpen(prev => !prev);   // 2e tap ouvre, 3e tap ferme (toggle)
        vibrate(10);
      }
    } else {
      setActiveTab(tab);
      setDrawerOpen(false);
      vibrate(8);
    }
  }

  const tabStyle = (tab) => ({
    flex: 1,
    padding: "10px 8px",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontFamily: "Phenomena, sans-serif",
    fontSize: 15,
    fontWeight: 800,
    transition: "all .15s",
    background: activeTab === tab ? C.accent : "transparent",
    color: activeTab === tab ? "#fff" : C.muted,
    letterSpacing: .3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  });

  return (
    <>
      {drawerOpen && (
        <div onClick={() => { setDrawerOpen(false); vibrate(8); }}
          style={{ position: "fixed", inset: 0, zIndex: 199, background: "transparent" }} />
      )}

      {drawerOpen && (
        <div style={{
          position: "fixed", bottom: 110, left: 0, right: 0, zIndex: 200,
          maxHeight: "50vh", display: "flex", flexDirection: "column",
          background: C.surface, borderTop: `2px solid ${C.gold}`,
          borderRadius: "16px 16px 0 0", boxShadow: "0 -4px 20px rgba(0,0,0,.12)",
        }}>
          <div style={{ padding: "12px 16px 8px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <button onClick={() => { onAddTask(); vibrate(10); }} style={{
              fontSize: 12, fontWeight: 700, color: "#fff",
              background: C.accent, border: "none",
              borderRadius: 8, padding: "6px 14px",
              cursor: "pointer", fontFamily: "inherit",
            }}>+ Todo</button>
          </div>

          <div style={{ overflowY: "auto", maxHeight: 210, padding: "0 0 20px" }}>
            {openTasks.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: C.muted, fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={C.muted} strokeWidth="1.6"/><circle cx="12" cy="12" r="5" stroke={C.muted} strokeWidth="1.6"/><circle cx="12" cy="12" r="1.4" fill={C.muted}/></svg>
                Tout est fait — belle journée terrain !
              </div>
            )}
            {openTasks.map(task => {
              const pr = PRIORITY[task.priority || "normal"];
              const isSwiped = swipeTaskId === task.id;
              return (
                <div key={task.id} style={{ position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", right: 0, top: 0, bottom: 0,
                    width: 160, display: "flex",
                    opacity: isSwiped ? 1 : 0, transition: "opacity .2s",
                  }}>
                    <div style={{ flex: 1, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <button onClick={() => { vibrate(20); onTaskDone(task); setSwipeTaskId(null); }}
                        style={{ background: "none", border: "none", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                        ✓ Valider
                      </button>
                    </div>
                    <div style={{ flex: 1, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <button onClick={() => { vibrate(15); onTaskDelete(task); setSwipeTaskId(null); }}
                        style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display:"flex", alignItems:"center", gap:4 }}>
                        <IconSuppr/>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}>Suppr.</span>
                      </button>
                    </div>
                  </div>

                  <div style={{
                    background: C.surface,
                    transform: isSwiped ? "translateX(-160px)" : "translateX(0)",
                    transition: "transform .2s",
                    padding: "12px 16px",
                    borderBottom: `0.5px solid ${C.border}`,
                    display: "flex", gap: 10, alignItems: "center", cursor: "pointer",
                  }}
                    onTouchStart={e => { e.currentTarget._ts = e.touches[0].clientX; }}
                    onTouchEnd={e => {
                      const dx = e.changedTouches[0].clientX - (e.currentTarget._ts || 0);
                      if (dx < -40) { setSwipeTaskId(task.id); vibrate(8); }
                      else if (dx > 20) setSwipeTaskId(null);
                    }}
                    onClick={() => {
                      if (swipeTaskId === task.id) { setSwipeTaskId(null); return; }
                      vibrate(10); onTaskClick(task); setDrawerOpen(false);
                    }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: pr.color, flexShrink: 0, boxShadow: `0 0 6px ${pr.color}88` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                        {task.title}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: pr.color, fontWeight: 600 }}>{pr.label}</span>
                        {task.dueDate && <span style={{ fontSize: 11, color: C.muted, display: "inline-flex", alignItems: "center", gap: 3 }}>·<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 4l9 16H3L12 4z" stroke={C.goldDark} strokeWidth="1.7" strokeLinejoin="round"/><path d="M12 10v4" stroke={C.goldDark} strokeWidth="1.7" strokeLinecap="round"/><circle cx="12" cy="16.8" r=".5" fill={C.goldDark}/></svg>{task.dueDate}</span>}
                        {task.recurrence && task.recurrence !== "none" && (
                          <span style={{ fontSize: 11, color: C.accent, display: "inline-flex", alignItems: "center", gap: 3 }}>·<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4.5 10a7.5 7.5 0 0112.6-3.2L20 9.5" stroke={C.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.5 14a7.5 7.5 0 01-12.6 3.2L4 14.5" stroke={C.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 5.5v4h-4M4 18.5v-4h4" stroke={C.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                        )}
                      </div>
                    </div>
                    
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barre fixe — 2 boutons SVG */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 110,
        background: C.surface, borderTop: `2px solid ${C.border}`,
        zIndex: 201, display: "flex", flexDirection: "column",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}>
        <div style={{ display: "flex", gap: 12, padding: "8px 20px 4px" }}>

          {/* Notes */}
          <button onClick={() => handleTabTap("notes")} style={{ ...tabStyle("notes"), position:"relative" }}>
            <span style={{ color: activeTab === "notes" ? "#fff" : C.accent }}>
              <IconNotes active={activeTab === "notes"}/>
            </span>
            Notes
            {noteCount > 0 && (
              <span style={{
                position:"absolute", top:4, right:6,
                background: activeTab==="notes" ? "rgba(255,255,255,0.3)" : C.accent,
                color:"#fff", borderRadius:10, fontSize:10, fontWeight:800,
                padding:"1px 6px", lineHeight:1.4,
              }}>{noteCount}</span>
            )}
          </button>

          {/* Todo */}
          <button onClick={() => handleTabTap("tasks")} style={{ ...tabStyle("tasks"), position: "relative" }}>
            <span style={{ color: activeTab === "tasks" ? "#fff" : C.accent }}>
              <IconTaches/>
            </span>
            Todo
            {openTasks.length > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 6,
                background: C.red, color: "#fff",
                borderRadius: 10, fontSize: 10, fontWeight: 800,
                padding: "1px 6px", lineHeight: 1.4,
              }}>{openTasks.length}</span>
            )}
          </button>
          {/* NomadFeed */}
          <button onClick={() => onOpenNomadFeed && onOpenNomadFeed()} style={{ ...tabStyle(null), opacity:.5 }}>
            <span style={{ color: C.accent }}>
              <FeedIcon size={20} />
            </span>
            Feed
          </button>

        </div>

        {activeTab && (
          <div style={{ fontSize: 12, color: C.muted, textAlign: "center", padding: "0 16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {MESSAGES[activeTab]}
          </div>
        )}
      </div>
    </>
  );
}
