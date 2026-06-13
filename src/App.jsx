import { runSync } from "./services/syncService.js";
import { useState, useEffect, useRef } from "react";
import { C, PRIORITY, GRID_START, GRID_END, GRID_TOTAL, SLOT_H, GRID_H, GRID_DEFAULT_SCROLL, RECURRENCE_OPTIONS } from "./utils/constants.js";
import { load, save, toISO, todayISO, getWeekStart, getWeekDays, fmtDay, fmtDayNum, fmtWeekRange, timeToMinutes, minutesToHHMM, timeToY, durationToH, slideTasksToToday, rruleToFr, makeAuthHeader } from "./utils/helpers.js";
import { caldavRequest, parseCalendars, parseEvents, expandRecurring } from "./utils/caldav.js";
import Modal, { Btn } from "./components/Modal.jsx";
import Header from "./components/Header.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import Settings from "./components/Settings.jsx";
import NomadBook from "./components/NomadBook.jsx";
import FeedbackButton from "./components/FeedbackButton.jsx";
import EventForm from "./components/EventForm.jsx";
import { checkCalendarExists, createCalendar, calendarDisplayName } from "./utils/caldavCalendar.js";
import TaskDrawer from "./components/TaskDrawer.jsx";

const USER_PLAN = "free";

// ── Préfixage clés localStorage par user ──────────────────────────────────────
// Format : nompartie@email + JJMMAAAA de 1ère connexion → ex: olivierclaverie31052026_
function userPrefix(email) {
  if (!email) return "";
  const name = email.split("@")[0].replace(/[^a-z0-9]/gi,"").toLowerCase();
  const storageKey = "user_created_" + name;
  let date = localStorage.getItem(storageKey);
  if (!date) {
    const now = new Date();
    date = String(now.getDate()).padStart(2,"0")
         + String(now.getMonth()+1).padStart(2,"0")
         + now.getFullYear();
    localStorage.setItem(storageKey, date);
  }
  return name + date + "_";
}
function uKey(email, key) {
  // cf_auth n'est jamais préfixé — clé globale de session
  if (key === "cf_auth") return key;
  return userPrefix(email) + key;
}

// ── Migration automatique anciennes clés → clés préfixées ─────────────────────
// S'exécute silencieusement au 1er démarrage après MAJ — aucune action user requise
function migrateOldKeys(email) {
  if (!email) return;
  const OLD_KEYS = ["cf_tasks","cf_events","cf_calendars","cf_settings"];
  OLD_KEYS.forEach(key => {
    const prefixed = uKey(email, key);
    const oldData  = localStorage.getItem(key);
    const newData  = localStorage.getItem(prefixed);
    // Migrer seulement si l'ancienne clé existe et la nouvelle est vide
    if (oldData && !newData) {
      localStorage.setItem(prefixed, oldData);
    }
  });
}

// ════════════════════════════════════════════════════════════════════════
// BOÎTE D'ENVOI — file d'attente des écritures faites hors-ligne.
// Une écriture impossible faute de réseau est rangée ici, puis rejouée
// automatiquement au retour du réseau (onOnline + au démarrage).
// ════════════════════════════════════════════════════════════════════════
function loadQueue(email){ try{ return JSON.parse(localStorage.getItem(`${email}_cf_pending`)||"[]"); }catch{ return []; } }
function saveQueue(email,q){ try{ localStorage.setItem(`${email}_cf_pending`, JSON.stringify(q)); }catch{} }
function enqueueWrite(email,entry){ const q=loadQueue(email); q.push({...entry, ts:Date.now()}); saveQueue(email,q); }

async function flushQueue(auth){
  if(!auth || !navigator.onLine) return;
  const q = loadQueue(auth.email);
  if(!q.length) return;
  const remaining=[];
  for(const item of q){
    try{
      if(item.op==="put")         await pushEvent(item.ev, auth, false, false);
      else if(item.op==="delete") await deleteEvent(item.ev, auth, false);
    }catch(e){ remaining.push(item); }   // échec → on garde pour la prochaine tentative
  }
  saveQueue(auth.email, remaining);
}

async function pushEvent(ev, auth, invalidateCache=true, queueable=true) {
  if (!auth || !ev.calHref) return;
  const uid = ev.id?.startsWith("calflow-") ? ev.id : `calflow-${Date.now()}@nomadcal`;
  const allDay = ev.allDay;
  const fmt = s => s ? s.replace(/-/g, "") : "";

  // ── TZID=Europe/Paris — RFC 5545 correct ──────────────────────────────────
  const dtstart = allDay
    ? `DTSTART;VALUE=DATE:${fmt(ev.startDate)}`
    : `DTSTART;TZID=Europe/Paris:${fmt(ev.startDate)}T${(ev.startTime||"09:00").replace(":","")+"00"}`;
  const dtend = allDay
    ? `DTEND;VALUE=DATE:${fmt(ev.endDate||ev.startDate)}`
    : `DTEND;TZID=Europe/Paris:${fmt(ev.endDate||ev.startDate)}T${(ev.endTime||"10:00").replace(":","")+"00"}`;

  // ── STATUS ICS — RFC 5545 ─────────────────────────────────────────────────
  const icsStatus = ev.status === "tentative" ? "STATUS:TENTATIVE"
    : ev.status === "cancelled" ? "STATUS:CANCELLED"
    : "STATUS:CONFIRMED";

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NomadCal//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}Z`,
    dtstart,
    dtend,
    `SUMMARY:${ev.title}`,
    icsStatus,
    ev.rrule&&!ev.isRecurring?`RRULE:${ev.rrule}`:"",
    ev.location?`LOCATION:${ev.location}`:"",
    ev.notes?`DESCRIPTION:${ev.notes.replace(/\n/g,"\\n")}`:"",
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean).join("\r\n");

  const path = ev.calHref + uid + ".ics";
  // ── BOÎTE D'ENVOI : hors-ligne → on range l'écriture au lieu de la perdre ──
  if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"put", ev}); return; }
  try {
    await caldavRequest("PUT", path, makeAuthHeader(auth.email, auth.appPassword), ics, {"Content-Type":"text/calendar; charset=utf-8"});
  } catch(e) {
    if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"put", ev}); return; }
    throw e;
  }

  // ── Cache invalidation — force sync fraîche après chaque write ────────────
  if (invalidateCache) {
    const cacheKey = Object.keys(localStorage).find(k => k.endsWith("_cf_events"));
    if (cacheKey) localStorage.removeItem(cacheKey);
  }
}

async function deleteEvent(ev, auth, queueable=true) {
  if (!auth) return;
  // Si pas de href local → cherche le vrai href via UID dans iCloud
  // Le syncCalDAV() après cette fonction récupère l'état réel
  if (!ev.href) {
    console.warn("[deleteEvent] Pas de href pour:", ev.id, "— sync forcée");
    return; // syncCalDAV() après va nettoyer
  }
  // ── BOÎTE D'ENVOI : hors-ligne → on range la suppression au lieu de la perdre ──
  if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"delete", ev}); return; }
  try {
    await caldavRequest("DELETE", ev.href, makeAuthHeader(auth.email, auth.appPassword));
  } catch(e) {
    if (queueable && !navigator.onLine) { enqueueWrite(auth.email, {op:"delete", ev}); return; }
    throw e;
  }
}

function layoutEvents(dayEvs) {
  if (!dayEvs.length) return [];
  const sorted = [...dayEvs].sort((a,b) => timeToMinutes(a.startTime||"00:00") - timeToMinutes(b.startTime||"00:00"));
  const columns = [];
  const result = [];
  sorted.forEach(ev => {
    const evStart = timeToMinutes(ev.startTime||"00:00");
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const lastEnd = timeToMinutes(columns[col].endTime||"01:00");
      if (evStart >= lastEnd) { columns[col] = ev; result.push({...ev, col, totalCols:1}); placed = true; break; }
    }
    if (!placed) { columns.push(ev); result.push({...ev, col:columns.length-1, totalCols:1}); }
  });
  result.forEach(ev => {
    const evStart = timeToMinutes(ev.startTime||"00:00");
    const evEnd   = timeToMinutes(ev.endTime||"01:00");
    const overlapping = result.filter(o => o !== ev && timeToMinutes(o.startTime||"00:00") < evEnd && timeToMinutes(o.endTime||"01:00") > evStart);
    ev.totalCols = overlapping.length + 1;
  });
  return result;
}

// ── Numéro de semaine ISO (commence Lundi) ────────────────────────────────────
function getWeekNum(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + 3 - (d.getDay()+6)%7);
  const week1 = new Date(d.getFullYear(),0,4);
  return 1 + Math.round(((d-week1)/86400000 - 3 + (week1.getDay()+6)%7)/7);
}

function TaskForm({ initial, onSave, onCancel }) {
  const [title,setTitle]           = useState(initial?.title||"");
  const [notes,setNotes]           = useState(initial?.notes||"");
  const [priority,setPriority]     = useState(initial?.priority||"normal");
  const [effectiveDate,setEffDate] = useState(initial?.effectiveDate||todayISO());
  const [dueDate,setDueDate]       = useState(initial?.dueDate||"");
  const [recurrence,setRecur]      = useState(initial?.recurrence||"none");
  const iStyle = { width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${C.border}`, background:C.bg, color:C.ink, fontSize:14, fontFamily:"inherit", outline:"none", marginBottom:10, boxSizing:"border-box" };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre de la tâche…" style={{...iStyle,fontSize:16,fontWeight:700}}/>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optionnel)" rows={2} style={{...iStyle,resize:"none"}}/>
      <label style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.5}}>PRIORITÉ</label>
      <div style={{display:"flex",gap:8,marginBottom:4}}>
        {Object.entries(PRIORITY).map(([k,p])=>(
          <button key={k} onClick={()=>setPriority(k)} style={{flex:1,padding:"10px 6px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${priority===k?p.color:C.border}`,background:priority===k?p.bg:"transparent",color:priority===k?p.color:C.muted,fontSize:11,fontWeight:700,textAlign:"center"}}>
            {p.icon}<br/><span style={{fontSize:10}}>{p.label}</span>
          </button>
        ))}
      </div>
      <label style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.5}}>APPARAÎT LE</label>
      <input type="date" value={effectiveDate} onChange={e=>setEffDate(e.target.value)} style={iStyle}/>
      <label style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.5}}>ÉCHÉANCE (OPTIONNEL)</label>
      <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={iStyle}/>
      <label style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.5,display:"flex",alignItems:"center",gap:6}}>RÉCURRENCE
        <button onClick={()=>alert("Récurrence vs Tâche glissante\n\nLa RÉCURRENCE recrée la tâche à la fréquence choisie.\n\nLa TÂCHE GLISSANTE glisse au lendemain si non faite.")} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:"50%",width:16,height:16,fontSize:10,cursor:"pointer",color:C.muted}}>?</button>
      </label>
      <select value={recurrence} onChange={e=>setRecur(e.target.value)} style={iStyle}>
        <option value="none">Aucune</option>
        <option value="daily">Quotidienne</option>
        <option value="weekly">Hebdomadaire</option>
        <option value="monthly">Mensuelle</option>
        {RECURRENCE_OPTIONS.filter(o=>o.value.includes("MONTHLY;BYDAY")).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
        <Btn onClick={onCancel}>Annuler</Btn>
        <Btn onClick={()=>{if(!title.trim())return;onSave({title:title.trim(),notes,priority,effectiveDate,dueDate,recurrence,type:"task",done:false,id:`task-${Date.now()}`,createdAt:new Date().toISOString()});}} variant="primary">Enregistrer la tâche</Btn>
      </div>
    </div>
  );
}

function EventPopover({ ev, onCopy, onEdit, onDelete, onClose, position }) {
  if (!ev || !position) return null;
  const isPending = ev.status === "tentative";
  const Item = ({label,icon,onClick,color}) => (
    <button onClick={onClick} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",padding:"6px 12px",color,fontSize:11,fontWeight:700}}>
      <span style={{fontSize:18}}>{icon}</span>{label}
    </button>
  );
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:299}}/>
      <div style={{position:"fixed",top:position.y,left:Math.min(Math.max(8,position.x),window.innerWidth-200),zIndex:300,background:C.surface,border:`1.5px solid ${isPending?"#F5A623":C.border}`,borderRadius:14,boxShadow:"0 6px 24px rgba(0,0,0,.2)",padding:"10px 8px",minWidth:190}}>
        <div style={{fontSize:12,fontWeight:800,color:isPending?"#B8741A":C.ink,marginBottom:6,padding:"0 8px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:180}}>
          {isPending&&<span style={{marginRight:4}}>🟠</span>}{ev.title}
        </div>
        <div style={{display:"flex",justifyContent:"space-around"}}>
          <Item label="Copier"   icon="📋" onClick={onCopy}   color={C.accent}/>
          <Item label="Modifier" icon="✎"  onClick={onEdit}   color={C.ink}/>
          <Item label="Suppr."   icon="🗑"  onClick={onDelete} color={C.red}/>
        </div>
      </div>
    </>
  );
}

function EventDetail({ ev, onEdit, onDelete, onCopy, onDone }) {
  if (!ev) return null;
  const isTask = ev.type === "task";
  const isSynthese = false; // Synthèses supprimées
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:20,fontWeight:800,color:C.ink,fontFamily:"Phenomena,sans-serif",lineHeight:1.3}}>{ev.title}</div>
      {ev.status==="tentative"&&<div style={{fontSize:12,color:"#B8741A",background:"#FFF8ED",border:"1px solid #F5A623",borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:4}}>🟠 À confirmer</div>}
      {ev.isRecurring&&<div style={{fontSize:12,color:C.accent,background:C.accentLight,border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:4}}><svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 10a6 6 0 0110-4.5" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 10a6 6 0 01-10 4.5" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 3v3h-3" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 17v-3h3" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Événement récurrent</div>}
      {ev.rrule&&!ev.isRecurring&&<div style={{fontSize:12,color:C.accent,background:C.accentLight,border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:4}}><svg width="13" height="13" viewBox="0 0 20 20" fill="none"><path d="M4 10a6 6 0 0110-4.5" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 10a6 6 0 01-10 4.5" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 3v3h-3" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 17v-3h3" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>{rruleToFr(ev.rrule)}</div>}
      <div style={{fontSize:14,color:C.muted}}>
        {ev.allDay?`📅 ${ev.startDate}${ev.endDate&&ev.endDate!==ev.startDate?` → ${ev.endDate}`:""}` : `📅 ${ev.startDate} · ${ev.startTime} → ${ev.endTime}`}
      </div>
      {isTask&&ev.effectiveDate&&<div style={{fontSize:13,color:C.muted}}>↻ Apparaît le {ev.effectiveDate}</div>}
      {isTask&&ev.dueDate&&<div style={{fontSize:13,color:C.red}}>⚠ Échéance {ev.dueDate}</div>}
      {ev.location&&<div style={{fontSize:14,color:C.muted}}>📍 {ev.location}</div>}
      {ev.notes&&<div style={{fontSize:14,color:C.ink,lineHeight:1.65,whiteSpace:"pre-wrap",background:C.bg,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`}}>{ev.notes}</div>}
      {!isSynthese&&<>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
          <Btn onClick={onEdit} variant="soft" style={{flex:1}}>✎ Modifier</Btn>
          <Btn onClick={onDelete} variant="danger" style={{flex:1}}>🗑 Supprimer</Btn>
        </div>
        {!isTask&&<Btn onClick={onCopy} variant="gold" style={{width:"100%",justifyContent:"center",display:"flex"}}>📋 Copier cet événement</Btn>}
        {isTask&&!ev.done&&<Btn onClick={onDone} variant="outline" style={{width:"100%",color:C.green,borderColor:C.green}}>✓ Marquer comme terminée</Btn>}
      </>}
    </div>
  );
}

export default function App() {
  // ── Auth — clé globale non préfixée ──────────────────────────────────────
  const [auth,setAuth] = useState(()=>load("cf_auth",null));

  // ── email dérivé de auth pour préfixer les clés ───────────────────────────
  const email = auth?.email || "";

  // ── États — clés préfixées par user ──────────────────────────────────────
  const [events,setEvents]       = useState(()=>load(uKey(email,"cf_events"),[]));
  const [tasks,setTasks]         = useState(()=>load(uKey(email,"cf_tasks"),[]));
  const [calendars,setCalendars] = useState(()=>load(uKey(email,"cf_calendars"),[]));
  const [settings,setSettings]   = useState(()=>load(uKey(email,"cf_settings"),{startHour:"8",endHour:"20",showDone:false}));

  const [screen,setScreen]           = useState("main");
  const [currentView,setCurrentView] = useState("week");
  const [syncing,setSyncing]         = useState(false);
  const [syncOk,setSyncOk]           = useState(true);
  const [saving,setSaving]           = useState(false); // Anti-doublon bouton Créer/Supprimer
  const [formOpen,setFormOpen]       = useState(false);
  const [taskFormOpen,setTaskFormOpen] = useState(false);
  const [editEv,setEditEv]           = useState(null);
  const [editTask,setEditTask]       = useState(null);
  const [clipboard,setClipboard]     = useState(null);
  const [pasteTarget,setPasteTarget] = useState(null);
  const [confirmDel,setConfirmDel]   = useState(null);
  const [confirmDone,setConfirmDone] = useState(null);
  const [swipeTaskId,setSwipeTaskId] = useState(null);
  const [popover,setPopover]         = useState(null);
  const [slotPrefill,setSlotPrefill] = useState(null); // Pré-remplissage tap long grille
  const [pulseCell,setPulseCell]     = useState(null); // Feedback visuel tap long
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fraisDate,setFraisDate]     = useState(null);
  const [nomadBookOpen,setNomadBookOpen] = useState(false);

  // ── UN SEUL état semaine ──────────────────────────────────────────────────
  const [weekStart,setWeekStart] = useState(()=>getWeekStart(new Date()));

  const touchStartX   = useRef(null);
  const touchStartY   = useRef(null);
  const gridScrollRef = useRef(null);
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);
  const evPressTimer = useRef(null);   // tap long sur un EVENT
  const evPressFired = useRef(false);

  const weekDays = getWeekDays(weekStart);
  const weekNum  = getWeekNum(weekStart);
  const today    = todayISO();

  useEffect(()=>{
    // Migration silencieuse au premier démarrage
    if (email) migrateOldKeys(email);
    if(gridScrollRef.current){
      gridScrollRef.current.scrollTop = (GRID_DEFAULT_SCROLL/GRID_TOTAL)*GRID_H;
    }
  },[]);

  // ── Sauvegarde préfixée par user ──────────────────────────────────────────
  useEffect(()=>{ if(email) save(uKey(email,"cf_tasks"),tasks); },[tasks,email]);
  useEffect(()=>{ if(email) save(uKey(email,"cf_events"),events); },[events,email]);
  useEffect(()=>{ if(email) save(uKey(email,"cf_calendars"),calendars); },[calendars,email]);
  useEffect(()=>{ if(email) save(uKey(email,"cf_settings"),settings); },[settings,email]);

  useEffect(()=>{
    const slide=()=>setTasks(prev=>slideTasksToToday(prev));
    slide();
    const now=new Date(); const midnight=new Date(now); midnight.setHours(24,0,0,0);
    const t=setTimeout(slide,midnight-now);
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    const check=()=>{
      const in48h=new Date(Date.now()+48*60*60*1000);
      const in48hISO=toISO(in48h);
      const pending=events.filter(e=>e.status==="tentative"&&e.startDate===in48hISO);
      if(pending.length>0){
        const titles=pending.map(e=>e.title).join(", ");
        if(window.confirm(`⚠️ RDV à confirmer dans 48h :\n${titles}\n\nVoulez-vous les confirmer ?`)){
          
setEvents(prev =>
  prev.map(e =>
    pending.some(p => p.id === e.id)
      ? { ...e, status: "confirmed" }
      : e
  )
);

        }
      }
    };
    check();
    const interval=setInterval(check,60*60*1000);
    return()=>clearInterval(interval);
  },[events]);

  useEffect(()=>{
    if(auth){ const t=setTimeout(()=>{ runSync({ auth, flushQueue, syncCalDAV }); },300); return()=>clearTimeout(t); }
  },[auth]);

  // ── Re-sync au retour réseau ──────────────────────────────────────────────
  useEffect(()=>{
    const onOnline  = () => { setSyncOk(true);  if(auth){ runSync({ auth, flushQueue, syncCalDAV }); } };
    const onOffline = () => { setSyncOk(false); };
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return()=>{
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  },[auth]);

  // ── Création silencieuse calendrier NomadCal au 1er login ─────────────────
  useEffect(()=>{
    if(!auth) return;
    async function setupCalendar(){
      try{
        const exists = await checkCalendarExists(auth);
        if(!exists){
          const result = await createCalendar(auth);
          if(result.success){
            showToast(`📅 Calendrier ${calendarDisplayName(auth.email)} créé dans votre iCloud`, "green");
          } else {
            showToast("📅 NomadCal fonctionne en mode local — calendrier iCloud indisponible pour l'instant", "amber");
          }
        }
      } catch {
        // Silencieux — pas de blocage si erreur réseau
      }
    }
    setupCalendar();
  },[auth]);
useEffect(() => {
  const data = JSON.parse(localStorage.getItem("nomad_feedback") || "[]");

if (data.length > 0) {

  const last = localStorage.getItem("last_feedback_prompt");
  const now = Date.now();

  // ✅ condition 17h
  const nowDate = new Date();
  const today17 = new Date();
  today17.setHours(17, 0, 0, 0);

  if (now < today17.getTime()) return;

  // ✅ anti-spam (1 fois / jour)
  if (last && now - last < 24 * 60 * 60 * 1000) return;

  const content = data.map(f =>
    `• ${new Date(f.date).toLocaleTimeString()} (${f.network})
Type : ${f.type}
Page : ${f.page}

→ ${f.text}`
  ).join("\n\n");

  const mail = `mailto:olivierclaverie@me.com?subject=NomadCal Feedback&body=${encodeURIComponent(content)}`;

  window.location.href = mail;

  // mémorise la date d’envoi
  localStorage.setItem("last_feedback_prompt", now);
}
  
}, []);
  // ── Navigation semaine ────────────────────────────────────────────────────
  function handleTouchStart(e){ touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; }
  function handleTouchEnd(e){
    if(!touchStartX.current) return;
    const dx=e.changedTouches[0].clientX-touchStartX.current;
    const dy=Math.abs(e.changedTouches[0].clientY-touchStartY.current);
    if(Math.abs(dx)>50&&dy<80){
      const n=new Date(weekStart); n.setDate(n.getDate()+(dx<0?7:-7)); setWeekStart(n);
    }
    touchStartX.current=null;
  }

  // ── Sync légère — fetch uniquement 1 calendrier (après création/suppression) ──
  async function syncCalendar(calHref) {
    if(!auth || !calHref) return;
    try {
      const authHeader = makeAuthHeader(auth.email, auth.appPassword);
      const since = new Date(); since.setHours(since.getHours() - 1); // Dernière heure
      const until = new Date(); until.setFullYear(until.getFullYear() + 1);
      const sinceStr = since.toISOString().replace(/[-:]/g,"").slice(0,15) + "Z";
      const untilStr = until.toISOString().replace(/[-:]/g,"").slice(0,15) + "Z";
      const {text:evXml} = await caldavRequest("REPORT", calHref, authHeader,
        `<?xml version="1.0"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:getetag/><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"><c:time-range start="${sinceStr}" end="${untilStr}"/></c:comp-filter></c:comp-filter></c:filter></c:calendar-query>`,
        {Depth:"1","Content-Type":"application/xml"});
      const cal = calendars.find(c => c.href === calHref);
      if(!cal) return;
      const evs = parseEvents(evXml, cal.href, cal.color, cal.displayName);
      const rStart = toISO(since); const rEnd = toISO(until);
      const freshEvs = [];
      evs.forEach(ev => {
        if(ev.rrule) freshEvs.push(...expandRecurring(ev, rStart, rEnd));
        else freshEvs.push(ev);
      });
      // Merge — remplace les events de ce calendrier uniquement
      setEvents(prev => {
        // ── GARDE-FOU : re-téléchargement vide alors qu'on avait des events ici ? On garde. ──
        const hadEvents = prev.some(e => e.calHref === calHref && !e.id?.startsWith("done-"));
        if(freshEvs.length === 0 && hadEvents) return prev;
        const otherCals = prev.filter(e => e.calHref !== calHref || e.id?.startsWith("done-"));
        const merged = [...otherCals, ...freshEvs];
        save(uKey(email,"cf_events"), merged);
        return merged;
      });
      setSyncOk(true);
    } catch { /* silencieux */ }
  }

  async function syncCalDAV(){
    if(!auth) return;
    setSyncing(true);
    try{
      const authHeader=makeAuthHeader(auth.email,auth.appPassword);
      await caldavRequest("PROPFIND","/1012673262/principal/",authHeader,`<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`,{Depth:"0"});
      const {text:calXml}=await caldavRequest("PROPFIND","/1012673262/calendars/",authHeader,`<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:a="http://apple.com/ns/ical/"><d:prop><d:displayname/><a:calendar-color/><d:resourcetype/></d:prop></d:propfind>`,{Depth:"1"});
      const cals=parseCalendars(calXml);
      // ── GARDE-FOU 1 : synchro revenue sans aucun calendrier ? On garde tout. ──
      if(cals.length===0 && calendars.length>0){ setSyncOk(true); setSyncing(false); return; }
      setCalendars(cals); save(uKey(email,"cf_calendars"),cals);
      const since=new Date(); since.setMonth(since.getMonth()-3);
      const until2=new Date(); until2.setFullYear(until2.getFullYear()+1);
      const untilStr=until2.toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
      const sinceStr=since.toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
      const allEvents=[];
      for(const cal of cals){
        const {text:evXml}=await caldavRequest("REPORT",cal.href,authHeader,
          `<?xml version="1.0"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><d:getetag/><c:calendar-data/></d:prop><c:filter><c:comp-filter name="VCALENDAR"><c:comp-filter name="VEVENT"><c:time-range start="${sinceStr}" end="${untilStr}"/></c:comp-filter></c:comp-filter></c:filter></c:calendar-query>`,
          {Depth:"1","Content-Type":"application/xml"});
        const evs=parseEvents(evXml,cal.href,cal.color,cal.displayName);
        const rStart=toISO(since); const rEnd=toISO(until2);
        evs.forEach(ev=>{
          if(ev.rrule) allEvents.push(...expandRecurring(ev,rStart,rEnd));
          else allEvents.push(ev);
        });
      }
      // ── Merge intelligent — préserve les events locaux non-CalDAV ──────────
      // (tâches terminées, events créés offline, etc.)
      // Merge intelligent — garde uniquement les tâches terminées locales
      // Les events calflow- qui ne sont plus dans iCloud sont supprimés → pas de résurrection !
      // ── GARDE-FOU 2 : synchro revenue sans aucun event ? On garde le cache. ──
      if(allEvents.length===0 && events.length>0){ setSyncOk(true); setSyncing(false); return; }
      // ── Tâches terminées : lues depuis le cache FRAIS, jamais une photo périmée ──
      const localOnly = load(uKey(email,"cf_events"),[]).filter(e => e.id?.startsWith("done-"));
      const merged = [...allEvents, ...localOnly];
      setEvents(merged); save(uKey(email,"cf_events"),merged);
      setSyncOk(true);
    }catch(e){ setSyncOk(false); }
    setSyncing(false);
  }

  function handleLogin(email,password){
    const authObj={email,appPassword:password,auth:makeAuthHeader(email,password)};
    setAuth(authObj); save("cf_auth",authObj);
    // Migration silencieuse des anciennes clés
    migrateOldKeys(email);
    // Charger les données de cet user
    setEvents(load(uKey(email,"cf_events"),[]));
    setTasks(load(uKey(email,"cf_tasks"),[]));
    setCalendars(load(uKey(email,"cf_calendars"),[]));
    setSettings(load(uKey(email,"cf_settings"),{startHour:"8",endHour:"20",showDone:false}));
  }

  // ── Toast générique ───────────────────────────────────────────────────────
  function showToast(message, color="green") {
    const bg = color==="green" ? C.green : color==="amber" ? C.amber : C.red;
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:700;font-family:Phenomena,sans-serif;z-index:9999;max-width:90vw;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.2);`;
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(), 3500);
  }

  function doneTask(task){
    const completedAt=new Date().toISOString();
    const completedDate=toISO(new Date());
    const completedTime=new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
    const doneEv={id:`done-${task.id}`,type:"task",done:true,title:task.title,startDate:completedDate,endDate:completedDate,startTime:completedTime,endTime:minutesToHHMM(timeToMinutes(completedTime)+30),calColor:C.green,calName:"Tâches",completedAt};
    const updatedTasks=tasks.map(t=>t.id===task.id?{...t,done:true,completedAt}:t);
    const updatedEvents=[...events,doneEv];
    save(uKey(email,"cf_tasks"),updatedTasks); save(uKey(email,"cf_events"),updatedEvents);
    setTasks(updatedTasks); setEvents(updatedEvents);
    if(navigator.vibrate) navigator.vibrate([10,50,20]);
    const toast=document.createElement("div");
    toast.textContent="✓ Tâche terminée !";
    toast.style.cssText=`position:fixed;top:80px;left:50%;transform:translateX(-50%);background:${C.green};color:#fff;padding:10px 20px;border-radius:20px;font-size:14px;font-weight:700;font-family:Phenomena,sans-serif;z-index:9999;`;
    document.body.appendChild(toast);
    setTimeout(()=>toast.remove(),2000);
  }

  function deleteTask(task){
    const u=tasks.filter(t=>t.id!==task.id);
    save(uKey(email,"cf_tasks"),u); setTasks(u);
  }

  function handleDeleteEvent(ev){
    if(USER_PLAN==="free") setConfirmDel(ev);
    else if(USER_PLAN==="abo1") setConfirmDel({...ev,_plan:"abo1"});
    else setConfirmDel({...ev,_plan:"abo2"});
  }

  if(!auth) return <LoginScreen onLogin={handleLogin}/>;
  if(screen==="settings") return <Settings settings={settings} setSettings={setSettings} calendars={calendars} onBack={()=>setScreen("main")} auth={auth}/>;

  // ── Filtre les events synthèse obsolètes du cache local ─────────────────
  const allEvs = events.filter(e => !e.id?.startsWith("synth-"));

return (
  
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",background:C.bg,overflow:"hidden",fontFamily:"Phenomena,Nunito,sans-serif"}}>
      <style>{`@keyframes nbload{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
      {syncing&&(
        <div style={{position:"fixed",top:0,left:0,right:0,height:3,zIndex:9999,background:C.accentLight,overflow:"hidden"}}>
          <div style={{height:"100%",width:"30%",background:C.accent,animation:"nbload 1.1s ease-in-out infinite"}}/>
        </div>
      )}

      {nomadBookOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:C.bg,overflowY:"auto"}}>
          <NomadBook onClose={()=>setNomadBookOpen(false)} auth={auth}/>
        </div>
      )}

      <Header
        weekDays={weekDays} syncing={syncing} syncOk={syncOk}
        onSync={() => runSync({ auth, flushQueue, syncCalDAV })} onSettings={()=>setScreen("settings")}
        onAddEvent={()=>{setEditEv(null);setSlotPrefill({
  startDate: todayISO(),
  endDate: todayISO(),
  startTime: "09:00",
  endTime: "10:00"
});setFormOpen(true);}}
        clipboard={clipboard} onClearClipboard={()=>{setClipboard(null);setPasteTarget(null);}}
        tasks={tasks} onToggleDrawer={()=>setDrawerOpen(o=>!o)}
        weekStart={weekStart} weekNum={weekNum} today={today}
        fmtDay={fmtDay} fmtDayNum={fmtDayNum}
        onToday={()=>{ setWeekStart(getWeekStart(new Date())); setCurrentView("week"); }}
        onGoToDate={date=>setWeekStart(getWeekStart(date))}
        onChangeView={setCurrentView}
        onOpenFrais={date=>setFraisDate(date)}
        currentView={currentView} fmtWeekRange={fmtWeekRange}
      />

      {/* Bannières all-day */}
      {allEvs.some(e=>e.allDay&&weekDays.some(d=>d>=e.startDate&&d<=e.endDate))&&(
        <div style={{display:"flex",background:C.bg,borderBottom:`1px solid ${C.border}`,padding:"4px 0",flexShrink:0}}>
          <div style={{width:36,flexShrink:0,fontSize:9,color:C.muted,textAlign:"center",paddingTop:4}}>Jour<br/>entier</div>
          <div style={{flex:1,position:"relative",minHeight:28}}>
            {allEvs.filter(e=>e.allDay&&weekDays.some(d=>d>=e.startDate&&d<=(e.endDate||e.startDate))).map(ev=>{
          
  const startIdx = Math.max(0, weekDays.indexOf(ev.startDate));
  const endIdx = Math.min(6, weekDays.findIndex(d => d > (ev.endDate || ev.startDate)) - 1);
  const span = Math.max(1, (endIdx < 0 ? 7 : endIdx + 1) - startIdx);

  return (
    <div
      key={ev.id}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: "relative",
        marginBottom: 2,
        marginLeft: `${(startIdx / 7) * 100}%`,
        width: `${(span / 7) * 100}%`,
        background: ev.calColor + "22",
        border: `1.5px solid ${ev.calColor}`,
        borderRadius: 6,
        padding: "2px 6px",
        cursor: "pointer",
        overflow: "hidden"
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: ev.calColor }}>
        → {ev.title}
      </span>
    </div>
  );
})
          
      {/* Grille horaire */}
      <div ref={gridScrollRef} style={{flex:1,overflowY:"auto",position:"relative",paddingBottom:96}}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div style={{display:"flex",height:GRID_H,position:"relative"}}>
          <div style={{width:36,flexShrink:0}}>
            {Array.from({length:24},(_,h)=>(
              <div key={h} style={{position:"absolute",top:(h*60/GRID_TOTAL)*GRID_H,left:0,width:36,fontSize:9,color:C.muted,textAlign:"right",paddingRight:4,fontFamily:"monospace"}}>{h}h</div>
            ))}
          </div>
          {weekDays.map(day=>{
            const isToday=day===today;
            const caldavEvs=allEvs.filter(e=>!e.allDay&&(e.startDate===day||(!e.isRecurring&&e.startDate<=day&&(e.endDate||e.startDate)>=day)));
            const doneTasks=tasks.filter(t=>t.done&&t.startDate===day);
            const dayEvs=[...caldavEvs,...doneTasks];
            const nowPct=isToday?(new Date().getHours()*60+new Date().getMinutes())/GRID_TOTAL:null;
            return(
              <div key={day} style={{flex:1,borderLeft:`1px solid ${C.border}`,position:"relative",background:isToday?"#2B5A9E08":"transparent"}}
                onTouchStart={e=>{
                  if(e.target!==e.currentTarget) return; // seulement zone vide, pas sur un event
                  const rect=e.currentTarget.getBoundingClientRect();
                  const relY=e.touches[0].clientY-rect.top;
                  const min=Math.round((relY/GRID_H)*GRID_TOTAL/30)*30;
                  const time=minutesToHHMM(Math.max(0,Math.min(GRID_END-30,min)));
                  longPressFired.current=false;
                  longPressTimer.current=setTimeout(()=>{
                    longPressFired.current=true;
                    setPulseCell({day,top:relY});
                    setTimeout(()=>setPulseCell(null),350);
                    if(clipboard){
                      setPasteTarget({date:day,time}); // flux coller
                    } else {
                      setSlotPrefill({startDate:day,endDate:day,startTime:time,endTime:minutesToHHMM(Math.min(GRID_END,min+60))});
                      setEditEv(null);
                      setFormOpen(true);
                    }
                  },450);
                }}
                onTouchMove={()=>{ if(longPressTimer.current){clearTimeout(longPressTimer.current);longPressTimer.current=null;} }}
                onTouchEnd={()=>{ if(longPressTimer.current){clearTimeout(longPressTimer.current);longPressTimer.current=null;} }}
                onClick={e=>{
                  if(longPressFired.current){longPressFired.current=false;return;}
                  if(popover){setPopover(null);return;}
                  const rect=e.currentTarget.getBoundingClientRect();
                  const relY=e.clientY-rect.top;
                  const min=Math.round((relY/GRID_H)*GRID_TOTAL/30)*30;
                  const time=minutesToHHMM(Math.max(0,Math.min(GRID_END-30,min)));
                  if(clipboard) setPasteTarget({date:day,time});

else {
  setSlotPrefill({
    startDate: day,
    endDate: day,
    startTime: time,
    endTime: minutesToHHMM(
      Math.min(GRID_END, timeToMinutes(time) + 60)
    ),
  });

  setEditEv(null);
  setFormOpen(true);
}

                }}>
                {pulseCell&&pulseCell.day===day&&<div style={{position:"absolute",top:pulseCell.top-16,left:2,right:2,height:32,background:C.gold+"44",border:`2px solid ${C.gold}`,borderRadius:8,pointerEvents:"none",zIndex:11}}/>}
                {nowPct&&<div style={{position:"absolute",top:`${nowPct*100}%`,left:0,right:0,height:2,background:C.red,zIndex:10}}><div style={{position:"absolute",left:-4,top:-3,width:8,height:8,borderRadius:"50%",background:C.red}}/></div>}
                {layoutEvents(dayEvs).map(ev=>{
                  const y=timeToY(ev.startTime||"09:00");
                  const h=Math.max(20,durationToH(ev.startTime||"09:00",ev.endTime||"10:00"));
                  const isTask=ev.type==="task";
                  const isPending=ev.status==="tentative";
                  const evColor=isTask?C.gold:(ev.calColor||C.accent);
                  const colW=100/(ev.totalCols||1);
                  const leftPct=(ev.col||0)*colW;
                  return(
                    <div key={ev.id+ev.col}
                      onTouchStart={e=>{
                        if(isTask) return;
                        const rect=e.currentTarget.getBoundingClientRect();
                        evPressFired.current=false;
                        evPressTimer.current=setTimeout(()=>{
                          evPressFired.current=true;
                          setPopover({ev,x:rect.left+rect.width/2-90,y:rect.top-92});
                        },450);
                      }}
                      onTouchMove={()=>{ if(evPressTimer.current){clearTimeout(evPressTimer.current);evPressTimer.current=null;} }}
                      onTouchEnd={()=>{ if(evPressTimer.current){clearTimeout(evPressTimer.current);evPressTimer.current=null;} }}
                      onClick={e=>{
                        e.stopPropagation();
                        if(evPressFired.current){evPressFired.current=false;return;}
                        if(isTask){setDrawerOpen(false);setTimeout(()=>setDetailEv({...ev,type:"task"}),50);return;}
                        setDetailEv(ev);
                      }}
                      style={{position:"absolute",top:y+1,left:`${leftPct+0.5}%`,width:`${colW-1}%`,height:h-2,background:isTask?(ev.done?C.green+"22":C.gold+"15"):"#fff",border:isTask?`2px solid ${evColor}`:`1px solid ${C.border}`,borderRadius:6,padding:isTask?"3px 4px":"3px 4px 3px 11px",cursor:"pointer",overflow:"hidden",opacity: ev.done ? 0.7 : 1,boxSizing:"border-box"}}>
                      {!isTask&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:6,background:evColor}}/>}
                      <div style={{fontSize:10,fontWeight:800,color:isPending?"#E07B17":(isTask?evColor:C.accent),lineHeight:1.3,textDecoration:ev.done?"line-through":"none"}}>
                        {isTask&&<span style={{marginRight:2}}>{ev.done?"✓ ":"↻ "}</span>}
                        {isPending&&<svg width="11" height="11" viewBox="0 0 20 20" fill="none" style={{verticalAlign:"-1px",marginRight:2}}><circle cx="10" cy="10" r="7" stroke="#E07B17" strokeWidth="1.8"/><path d="M10 6.3V10l2.6 1.6" stroke="#E07B17" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        <span style={{fontSize:10,opacity:.9}}>{ev.startTime} </span>
                        <span style={{wordBreak:"break-word",whiteSpace:"pre-wrap"}}>{ev.title}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {popover&&(
        <EventPopover ev={popover.ev} position={{x:popover.x,y:popover.y}}
          onClose={()=>setPopover(null)}
          onCopy={()=>{setClipboard(popover.ev);setPopover(null);showToast("📋 Copié — tap long sur un créneau pour coller","amber");}}
          onEdit={()=>{setEditEv(popover.ev);setSlotPrefill(null);setFormOpen(true);setPopover(null);}}
          onDelete={()=>{handleDeleteEvent(popover.ev);setPopover(null);}}
        />
      )}

      <TaskDrawer
        tasks={tasks} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}
        swipeTaskId={swipeTaskId} setSwipeTaskId={setSwipeTaskId}
        onTaskClick={t=>{setDrawerOpen(false);setTimeout(()=>setDetailEv({...t,type:"task"}),50);}}
        onTaskDone={t=>setConfirmDone(t)}
        onTaskDelete={t=>setConfirmDel({...t,type:"task"})}
        onAddTask={()=>setTaskFormOpen(true)}
        onOpenNomadBook={()=>setNomadBookOpen(true)}
        noteCount={(() => { try {
          const notes=JSON.parse(localStorage.getItem("nb_notes")||"[]");
          const periods=JSON.parse(localStorage.getItem("nb_periods_cache")||"[]");
          const now=new Date();
          const cur=periods.find(p=>now>=new Date(p.startISO)&&now<new Date(p.endISO))||periods[0];
          if(!cur) return 0;
          return notes.filter(n=>n.periodId===cur.uid&&n.periodId!=="pending").length;
        } catch { return 0; } })()}
        onOpenNomadFeed={()=>alert("NomadFeed — bientôt disponible ! 🚀")}
      />

      {formOpen && (
        <EventForm initial={editEv||slotPrefill} calendars={calendars} defaultCalHref={settings.defaultCalHref} saving={saving} onCancel={()=>{setFormOpen(false);setEditEv(null);setSlotPrefill(null);}} onSave={async ev=>{
  if(saving) return;
  setSaving(true);
  const newEv={...ev,id:editEv?.id||`calflow-${Date.now()}`,calColor:calendars.find(c=>c.href===ev.calHref)?.color||C.accent,calName:calendars.find(c=>c.href===ev.calHref)?.displayName||"",type:"event"};
  setEvents(prev=>editEv?prev.map(e=>e.id===editEv.id?newEv:e):[...prev,newEv]);
  setFormOpen(false); setEditEv(null);
  setSaving(false);

await pushEvent(newEv, auth);

// ── Sync complète SAFE ────────────────────────────────
// iCloud peut retarder l’indexation immédiate d’un event.
// Une sync légère peut alors écraser l’event optimistic local.
// La sync complète évite la disparition temporaire.
await runSync({ auth, flushQueue, syncCalDAV })

}}/>
      )}

      <Modal open={taskFormOpen} onClose={()=>{setTaskFormOpen(false);setEditTask(null);}} title={editTask?"Modifier la tâche":"↻ Nouvelle tâche glissante"}>
        <TaskForm initial={editTask} onCancel={()=>{setTaskFormOpen(false);setEditTask(null);}} onSave={task=>{setTasks(prev=>editTask?prev.map(t=>t.id===editTask.id?{...task,id:editTask.id}:t):[...prev,task]);setTaskFormOpen(false);setEditTask(null);}}/>
      </Modal>


      <Modal open={!!confirmDone} onClose={()=>setConfirmDone(null)} title="✓ Confirmer la validation">
        {confirmDone&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:C.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,fontSize:15,color:C.ink,marginBottom:4}}>{confirmDone.title}</div>
            <div style={{fontSize:12,color:C.muted}}>Elle sera inscrite dans la grille à {new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setConfirmDone(null)}>Annuler</Btn>
            <Btn variant="primary" style={{background:C.green}} onClick={()=>{doneTask(confirmDone);setConfirmDone(null);}}>✓ Oui, terminée !</Btn>
          </div>
        </div>}
      </Modal>

      <Modal open={!!confirmDel} onClose={()=>setConfirmDel(null)} title="Confirmer la suppression">
        {confirmDel&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:14,color:C.muted}}>Supprimer <strong>{confirmDel.title}</strong> ?</div>
          {confirmDel._plan==="abo1"&&(
            <div style={{background:C.accentLight,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.accentBorder}`,fontSize:13,color:C.accent}}>
              Voulez-vous prévenir le contact ?
              <div style={{display:"flex",gap:8,marginTop:8}}>
                <Btn variant="soft" onClick={()=>{if(navigator.share)navigator.share({title:`Annulation — ${confirmDel.title}`,text:`Bonjour, je dois annuler notre RDV du ${confirmDel.startDate}.`});}}>📱 Prévenir</Btn>
                <Btn variant="outline">Passer</Btn>
              </div>
            </div>
          )}
          {confirmDel._plan==="abo2"&&(
            <div style={{background:C.accentLight,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.accentBorder}`,fontSize:13,color:C.accent}}>
              Voulez-vous prévenir le contact et rechercher un nouveau créneau ?
              <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                <Btn variant="soft" onClick={()=>{if(navigator.share)navigator.share({title:`Annulation — ${confirmDel.title}`,text:`Bonjour, je dois annuler notre RDV du ${confirmDel.startDate}. Je vous propose un nouveau créneau très bientôt.`});}}>📱 Prévenir</Btn>
                <Btn variant="soft" onClick={()=>alert("Recherche IA d'un nouveau créneau — bientôt disponible !")}>🤖 Nouveau créneau</Btn>
                <Btn variant="outline">Passer</Btn>
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setConfirmDel(null)}>Annuler</Btn>
            <Btn variant="danger" disabled={saving} onClick={async()=>{
              if(saving) return; // Anti-doublon
              setSaving(true);
              if(confirmDel.type==="task") { deleteTask(confirmDel); setSaving(false); }
              else {
                setEvents(prev=>prev.filter(e=>e.id!==confirmDel.id)); // Cache local immédiat
                setConfirmDel(null); // Ferme IMMÉDIATEMENT
                setSaving(false);
                // Suppression → syncCalDAV() COMPLET obligatoire
                // syncCalendar() ne détecte pas les suppressions (fetch dernière heure seulement)
               

try {
  await deleteEvent(confirmDel, auth);
  await runSync({ auth, flushQueue, syncCalDAV });
} catch (e) {
  console.error("delete failed", e);
}


              }

            }}>Supprimer</Btn>
          </div>
        </div>}
      </Modal>

      <Modal open={!!clipboard&&!!pasteTarget} onClose={()=>setPasteTarget(null)} title="📋 Coller l'événement">
        {clipboard&&pasteTarget&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:C.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
            <div style={{fontWeight:700,fontSize:15,color:C.ink,marginBottom:4}}>{clipboard.title}</div>
            <div style={{fontSize:13,color:C.muted}}>📅 {pasteTarget.date} · {pasteTarget.time}</div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setPasteTarget(null)}>Annuler</Btn>
            <Btn variant="primary" onClick={()=>{
              const duration=Math.max(30,timeToMinutes(clipboard.endTime||"10:00")-timeToMinutes(clipboard.startTime||"09:00"));
              // Ouvre la fenêtre de création PRÉ-REMPLIE (nouvelle date/heure) — l'user valide
              setSlotPrefill({
                title:clipboard.title, allDay:clipboard.allDay, status:clipboard.status,
                calHref:clipboard.calHref, location:clipboard.location, notes:clipboard.notes,
                rue:clipboard.rue, cp:clipboard.cp, ville:clipboard.ville, email:clipboard.email, tel:clipboard.tel,
                startDate:pasteTarget.date, endDate:pasteTarget.date,
                startTime:pasteTarget.time, endTime:minutesToHHMM(timeToMinutes(pasteTarget.time)+duration),
              });
              setEditEv(null);
              setClipboard(null); setPasteTarget(null);
              setFormOpen(true);
            }}>Coller ici</Btn>
          </div>
        </div>}
      </Modal>

      <Modal open={!!fraisDate} onClose={()=>setFraisDate(null)} title={`Frais du ${fraisDate||""}`}>
        <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:14}}>
          Module Frais — bientôt disponible en Premium 🚀
        </div>
      </Modal>

      <FeedbackButton auth={auth} currentPage={nomadBookOpen?"NomadBook":"NomadCal"}/>

    </div>
  );
}
