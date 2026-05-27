import { useState } from "react";
import { C, PRIORITY } from '../utils/constants.js';

export default function TaskDrawer({
  tasks,
  drawerOpen,
  setDrawerOpen,
  swipeTaskId,
  setSwipeTaskId,
  onTaskClick,
  onTaskDone,
  onTaskDelete,
  onAddTask,
}) {
  const [activeTab, setActiveTab] = useState(null); // null | "notes" | "tasks" | "frais"
  const openTasks = tasks.filter(t => !t.done);

  // Messages contextuels par onglet
  const MESSAGES = {
    notes: "📝 NomadNotes — Capturez vos notes terrain et générez vos synthèses avec Claude",
    tasks: `↻ ${openTasks.length} tâche${openTasks.length>1?"s":""} en cours — Double tap pour ouvrir`,
    frais: "💰 Module Frais — Kilométrage, repas, péages — Bientôt disponible en Premium",
  };

  function handleTabTap(tab) {
    if (activeTab === tab) {
      // 2ème tap → ouvre la fonction
      if (tab === "notes") {
        window.open("https://notes-flow-six.vercel.app", "_blank");
      } else if (tab === "tasks") {
        setDrawerOpen(true);
      }
      // frais → rien pour l'instant
    } else {
      // 1er tap → sélectionne et affiche le message
      setActiveTab(tab);
      setDrawerOpen(false);
    }
  }

  const tabStyle = (tab) => ({
    flex: 1,
    padding: "8px 4px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "Phenomena, sans-serif",
    fontSize: 16,
    fontWeight: 800,
    transition: "all .15s",
    background: activeTab === tab ? C.accent : "transparent",
    color: activeTab === tab ? "#fff" : C.muted,
    letterSpacing: .3,
  });

  return (
    <>
      {/* Tiroir tâches déplié */}
      {drawerOpen && (
        <div style={{
          position: "fixed",
          bottom: 70,
          left: 0,
          right: 0,
          zIndex: 200,
          maxHeight: "50vh",
          display: "flex",
          flexDirection: "column",
          background: C.surface,
          borderTop: `2px solid ${C.gold}`,
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 -4px 20px rgba(0,0,0,.12)",
        }}>
          {/* Handle + fermer */}
          <div onClick={() => setDrawerOpen(false)}
            style={{ padding: "8px 16px 6px", cursor: "pointer", flexShrink: 0, textAlign: "center" }}>
            <div style={{ fontSize: 20, color: C.gold, fontWeight: 700 }}>↓</div>
          </div>

          {/* Bouton + Tâche */}
          <div style={{ padding: "0 16px 8px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
            <button onClick={onAddTask} style={{
              fontSize: 11, fontWeight: 700, color: "#fff",
              background: C.accent, border: "none",
              borderRadius: 8, padding: "4px 10px",
              cursor: "pointer", fontFamily: "inherit",
            }}>+ Tâche</button>
          </div>

          {/* Liste tâches */}
          <div style={{ overflowY: "auto", flex: 1, padding: "0 0 20px" }}>
            {openTasks.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: C.muted, fontSize: 13 }}>
                Aucune tâche en cours 🎉
              </div>
            )}
            {openTasks.map(task => {
              const pr = PRIORITY[task.priority || "normal"];
              const isSwiped = swipeTaskId === task.id;
              return (
                <div key={task.id} style={{ position: "relative", overflow: "hidden" }}>
                  <div style={{
                    position: "absolute", right: 0, top: 0, bottom: 0, width: 80,
                    background: C.red,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: isSwiped ? 1 : 0, transition: "opacity .2s",
                  }}>
                    <button onClick={() => { onTaskDelete(task); setSwipeTaskId(null); }}
                      style={{ background: "none", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      🗑 Suppr.
                    </button>
                  </div>
                  <div style={{
                    background: C.surface,
                    transform: isSwiped ? "translateX(-80px)" : "translateX(0)",
                    transition: "transform .2s",
                    padding: "12px 16px",
                    borderBottom: `0.5px solid ${C.border}`,
                    display: "flex", gap: 10, alignItems: "center", cursor: "pointer",
                  }}
                    onTouchStart={e => { e.currentTarget._ts = e.touches[0].clientX; }}
                    onTouchEnd={e => {
                      const dx = e.changedTouches[0].clientX - (e.currentTarget._ts || 0);
                      if (dx < -40) setSwipeTaskId(task.id);
                      else if (dx > 20) setSwipeTaskId(null);
                    }}
                    onClick={() => {
                      if (swipeTaskId === task.id) { setSwipeTaskId(null); return; }
                      onTaskClick(task);
                      setDrawerOpen(false);
                    }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: pr.color, flexShrink: 0, boxShadow: `0 0 6px ${pr.color}88` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                        {task.title}
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: pr.color, fontWeight: 600 }}>{pr.label}</span>
                        {task.dueDate && <span style={{ fontSize: 11, color: C.muted }}>· {task.dueDate}</span>}
                        {task.recurrence && task.recurrence !== "none" && <span style={{ fontSize: 11, color: C.accent }}>· 🔁</span>}
                      </div>
                    </div>
                    <span style={{ color: C.muted, fontSize: 20, flexShrink: 0 }}>›</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Barre fixe 70px */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: 110,
        background: C.surface,
        borderTop: `2px solid ${C.border}`,
        zIndex: 201,
        display: "flex",
        flexDirection: "column",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}>
        {/* 3 boutons */}
        <div style={{ display: "flex", gap: 6, padding: "6px 12px 4px" }}>
          <button onClick={() => handleTabTap("notes")} style={tabStyle("notes")}>
            📝 Notes
          </button>
          <button onClick={() => handleTabTap("tasks")} style={{
            ...tabStyle("tasks"),
            position: "relative",
          }}>
            ↻ Tâches
            {openTasks.length > 0 && (
              <span style={{
                position: "absolute", top: 2, right: 4,
                background: C.red, color: "#fff",
                borderRadius: 10, fontSize: 9, fontWeight: 800,
                padding: "1px 5px", lineHeight: 1.4,
              }}>{openTasks.length}</span>
            )}
          </button>
          <button onClick={() => handleTabTap("frais")} style={tabStyle("frais")}>
            💰 Frais
          </button>
        </div>

        {/* Message contextuel */}
        {activeTab && (
          <div style={{
            fontSize: 11, color: C.muted,
            textAlign: "center",
            padding: "0 16px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {MESSAGES[activeTab]}
          </div>
        )}
      </div>
    </>
  );
}
