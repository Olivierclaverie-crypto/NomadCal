import { runSync } from "./services/syncService.js";
import { loadQueue, saveQueue, enqueueWrite, pushEvent, deleteEvent, pushOccurrenceException, mergeEvents, loadTombstones, addTombstone, removeTombstone } from "./sync/index.js";
import { useState, useEffect, useRef } from "react";
import { C, PRIORITY, GRID_START, GRID_END, GRID_TOTAL, SLOT_H, GRID_H, GRID_DEFAULT_SCROLL, RECURRENCE_OPTIONS } from "./utils/constants.js";
import { load, save, toISO, todayISO, getWeekStart, getWeekDays, fmtDay, fmtDayNum, fmtWeekRange, timeToMinutes, minutesToHHMM, timeToY, durationToH, slideTasksToToday, rruleToFr, makeAuthHeader, userPrefix, uKey } from "./utils/helpers.js";
import { caldavRequest, parseCalendars, parseEvents, expandRecurring, mergeRecurrenceExceptions } from "./utils/caldav.js";
import Modal, { Btn } from "./components/Modal.jsx";
import Header from "./components/Header.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import Settings from "./components/Settings.jsx";
import NomadBook from "./components/NomadBook.jsx";
import FeedbackButton from "./components/FeedbackButton.jsx";
import EventForm from "./components/EventForm.jsx";
import { checkCalendarExists, createCalendar, calendarDisplayName } from "./utils/caldavCalendar.js";
import NomadTask from "./components/NomadTask.jsx";
import DebugPanel from "./components/DebugPanel.jsx";
import EventPopoverNew from "./components/EventPopover.jsx";
import EventPopoverPaste from "./components/EventPopoverPaste.jsx";
import { ToastProvider } from "./components/Toast/ToastContext.jsx";

const USER_PLAN = "free";



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

async function flushQueue(auth, onPutSuccess, onDeleteSuccess){
  if(!auth || !navigator.onLine) return;
  const q = loadQueue(auth.email);
  if(!q.length) return;
  const remaining=[];
  for(const item of q){
    try{
      if(item.op==="put")         { await pushEvent(item.ev, auth, false, false); onPutSuccess?.(item.ev.id); }
      else if(item.op==="delete") { await deleteEvent(item.ev, auth, false); onDeleteSuccess?.(item.ev.id); }
      else if(item.op==="exception") { const r = await pushOccurrenceException(item.ev, auth); if(r?.ok) onPutSuccess?.(item.ev.id); else remaining.push(item); }
    }catch(e){ remaining.push(item); }   // échec → on garde pour la prochaine tentative
  }
  saveQueue(auth.email, remaining);
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

export default function App() {
  // ── Auth — clé globale non préfixée ──────────────────────────────────────
  const [auth,setAuth] = useState(()=>load("cf_auth",null));

  // ── email dérivé de auth pour préfixer les clés ───────────────────────────
  const email = auth?.email || "";

  // ── États — clés préfixées par user ──────────────────────────────────────
  const [events,setEvents]       = useState(()=>load(uKey(email,"cf_events"),[]));
  const [tasks,setTasks]         = useState(()=>load(uKey(email,"cf_tasks"),[]));
  const [calendars,setCalendars] = useState(()=>load(uKey(email,"cf_calendars"),[]));
  const [settings,setSettings]   = useState(()=>load(uKey(email,"cf_settings"),{startHour:"8",endHour:"20",showDone:false,debugToast:false,showDebugPanel:false}));

  const [screen,setScreen]           = useState("main");
  const [currentView,setCurrentView] = useState("week");
  const [syncing,setSyncing]         = useState(false);
  const [syncOk,setSyncOk]           = useState(true);
  const [isOnline,setIsOnline]       = useState(navigator.onLine);
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

  const [ghostSlot, setGhostSlot] = useState(null);

  const clearPendingEdit = id => setEvents(prev => prev.map(e => e.id===id ? {...e, _pendingEdit:undefined} : e));
  const clearTombstone = id => auth && removeTombstone(auth.email, id);

  const touchStartX    = useRef(null);
  const touchStartY    = useRef(null);
  const gridScrollRef  = useRef(null);
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);
  const evPressTimer   = useRef(null);
  const evPressFired   = useRef(false);
  const clipboardTimer = useRef(null);

  function copyToClipboard(ev) {
    if (clipboardTimer.current) clearTimeout(clipboardTimer.current);
    setClipboard(ev);
    setPasteTarget(null);
    clipboardTimer.current = setTimeout(() => setClipboard(null), 60000);
  }

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
  useEffect(()=>{
    if(!email) return;
    const toSave = settings.showDebugPanel ? events : events.map(({rawICS,...e})=>e);
    save(uKey(email,"cf_events"),toSave);
  },[events,email,settings.showDebugPanel]);
  useEffect(()=>{ if(email) save(uKey(email,"cf_calendars"),calendars); },[calendars,email]);
  useEffect(()=>{ if(email) save(uKey(email,"cf_settings"),settings); },[settings,email]);
  useEffect(()=>{ if(typeof window!=="undefined") window.__debugToast=!!settings.debugToast; },[settings.debugToast]);

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
    if(auth){ const t=setTimeout(()=>{ runSync({ auth, flushQueue, syncCalDAV, onPutSuccess: clearPendingEdit, onDeleteSuccess: clearTombstone }); },300); return()=>clearTimeout(t); }
  },[auth]);

  // ── Re-sync au retour réseau ──────────────────────────────────────────────
  useEffect(()=>{
    const onOnline  = () => { setIsOnline(true); setSyncOk(true);  if(auth){ runSync({ auth, flushQueue, syncCalDAV, onPutSuccess: clearPendingEdit, onDeleteSuccess: clearTombstone }); } };
    const onOffline = () => { setIsOnline(false); setSyncOk(false); };
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
        const freshIds = new Set(freshEvs.map(e => e.id));
        const otherCals = prev.filter(e =>
          e.calHref !== calHref ||
          e.id?.startsWith("done-") ||
          (e._pending === true && !freshIds.has(e.id))
        );
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
      const localEvents = load(uKey(email,"cf_events"),[]);
      const tombstones = loadTombstones(email);
      const merged = mergeEvents(allEvents, localEvents, tombstones);
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
    setSettings(load(uKey(email,"cf_settings"),{startHour:"8",endHour:"20",showDone:false,debugToast:false}));
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
  if(screen==="settings") return <Settings settings={settings} setSettings={setSettings} calendars={calendars} onBack={()=>setScreen("main")} auth={auth} onOpenDebug={()=>setScreen("debug")}/>;
  if(screen==="debug") return <DebugPanel events={events} onBack={()=>setScreen("main")}/>;

  // ── Fusion couche 2 (exceptions RECURRENCE-ID) + filtre synthèses obsolètes ──
  const allEvs = mergeRecurrenceExceptions(events).filter(e => !e.id?.startsWith("synth-"));

return (
  <ToastProvider>
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",background:C.bg,overflow:"hidden",fontFamily:"Phenomena,Nunito,sans-serif"}}>
      <style>{`@keyframes nbload{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}`}</style>
      {syncing&&(
        <div style={{position:"fixed",top:0,left:0,right:0,height:3,zIndex:9999,background:C.accentLight,overflow:"hidden"}}>
          <div style={{height:"100%",width:"30%",background:C.accent,animation:"nbload 1.1s ease-in-out infinite"}}/>
        </div>
      )}

      {nomadBookOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:400,background:C.bg,overflowY:"auto"}}>
          <NomadBook onClose={()=>setNomadBookOpen(false)} auth={auth}
            onPeriodDeleted={periodUid => setEvents(prev => prev.filter(e => e.id !== periodUid))}
          />
        </div>
      )}

      <Header
        weekDays={weekDays} syncing={syncing} syncOk={syncOk} isOnline={isOnline}
        onSync={() => runSync({ auth, flushQueue, syncCalDAV, onPutSuccess: clearPendingEdit, onDeleteSuccess: clearTombstone })} onSettings={()=>setScreen("settings")}
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

  <div style={{width:36,flexShrink:0,fontSize:9,color:C.muted,textAlign:"center",paddingTop:4}}>
    Jour<br/>entier
  </div>

  <div style={{flex:1,position:"relative",minHeight:28}}>
    {allEvs
      .filter(e =>
        e.allDay &&
        weekDays.some(d => d >= e.startDate && d <= (e.endDate || e.startDate))
      )
      .map(ev => {
        const startIdx = Math.max(0, weekDays.indexOf(ev.startDate));
        const endIdx = Math.min(
          6,
          weekDays.findIndex(d => d > (ev.endDate || ev.startDate)) - 1
        );
        const span = Math.max(
          1,
          (endIdx < 0 ? 7 : endIdx + 1) - startIdx
        );

        return (
          <div
            key={ev.id}
            onClick={e => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              setPopover({
                ev,
                eventRect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width, height: rect.height }
              });
            }}
            style={{
              position: "relative",
              marginBottom: 2,
              marginLeft: `${(startIdx / 7) * 100}%`,
              width: `${(span / 7) * 100}%`,
              background: "#ffffff",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "3px 8px 3px 10px",
              overflow: "hidden",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:5,background:ev.calColor,borderRadius:"6px 0 0 6px"}}/>
            <span style={{fontSize:11,fontWeight:700,color:C.accent,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
              {ev.title}
            </span>
          </div>
        );
      })}
  </div>
</div>
  )}

      {/* Grille horaire */}
      <div ref={gridScrollRef} style={{flex:1,overflowY:"auto",position:"relative",paddingBottom:96}}
        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div style={{display:"flex",height:GRID_H,position:"relative"}}>
          <div style={{width:28,flexShrink:0}}>
            {Array.from({length:24},(_,h)=>(
             <div key={h} style={{position:"absolute",top:(h*60/GRID_TOTAL)*GRID_H,left:-2,width:28,fontSize:9,color:C.muted,textAlign:"right",paddingRight:2,fontFamily:"monospace"}}>{h}h</div>
            ))}
          </div>
          {weekDays.map(day=>{
            const isToday=day===today;
            const caldavEvs=allEvs.filter(e=>!e.allDay&&(e.startDate===day||(!e.isRecurring&&e.startDate<=day&&(e.endDate||e.startDate)>=day)));
            const doneTasks=tasks.filter(t=>t.done&&t.startDate===day);
            const dayEvs=[...caldavEvs,...doneTasks];
            const nowPct=isToday?(new Date().getHours()*60+new Date().getMinutes())/GRID_TOTAL:null;
            return(
   <div key={day} style={{flex:isToday?1.08:0.98,borderLeft:`1px solid ${C.border}`,position:"relative",background:isToday?"#2B5A9E08":"transparent"}}
                onTouchStart={e=>{
                  if(e.target!==e.currentTarget) return; // seulement zone vide, pas sur un event
                  const rect=e.currentTarget.getBoundingClientRect();
                  const relY=e.touches[0].clientY-rect.top;
                  const min=Math.round((relY/GRID_H)*GRID_TOTAL/30)*30;
                  const time=minutesToHHMM(Math.max(0,Math.min(GRID_END-30,min)));
                  // Stocke la position pour onTouchEnd
                  longPressTimer.current={relY,min,time};
                }}
                onTouchMove={()=>{ longPressTimer.current=null; }}
                onTouchEnd={(e)=>{
                  if(!longPressTimer.current) return; // annulé par un swipe
                  const {relY,min,time}=longPressTimer.current;
                  longPressTimer.current=null;
                  // tap court → création ou coller
                  setPulseCell({day,top:relY});
                  setTimeout(()=>setPulseCell(null),350);
                  if(clipboard){
                    const dayRect=e.currentTarget.getBoundingClientRect();
                    const tapY=dayRect.top+relY;
                    setPasteTarget({date:day,time,eventRect:{top:tapY,bottom:tapY+10,left:dayRect.left,right:dayRect.right,width:dayRect.width,height:10}});
                  } else {
                    setSlotPrefill({startDate:day,endDate:day,startTime:time,endTime:minutesToHHMM(Math.min(GRID_END,min+60))});
                    setEditEv(null);
                    setFormOpen(true);
                  }
                }}

                
                onClick={e=>{
                  if(longPressFired.current){longPressFired.current=false;return;}
                  if(popover){setPopover(null);return;}
                  const rect=e.currentTarget.getBoundingClientRect();
                  const relY=e.clientY-rect.top;
                  const min=Math.round((relY/GRID_H)*GRID_TOTAL/30)*30;
                  const time=minutesToHHMM(Math.max(0,Math.min(GRID_END-30,min)));
                  if(clipboard){ const tapY=e.clientY; setPasteTarget({date:day,time,eventRect:{top:tapY,bottom:tapY+10,left:rect.left,right:rect.right,width:rect.width,height:10}}); }

else {
  const rect = e.currentTarget.getBoundingClientRect();

  setPopover({
    ev,
    x: rect.left + rect.width / 2,
    y: rect.top - 60
  });
}

                }}>
                {pulseCell&&pulseCell.day===day&&<div style={{position:"absolute",top:pulseCell.top-16,left:2,right:2,height:32,background:C.gold+"44",border:`2px solid ${C.gold}`,borderRadius:8,pointerEvents:"none",zIndex:11}}/>}
                {nowPct&&<div style={{position:"absolute",top:`${nowPct*100}%`,left:0,right:0,height:2,background:C.red,zIndex:10}}><div style={{position:"absolute",left:-4,top:-3,width:8,height:8,borderRadius:"50%",background:C.red}}/></div>}
                {ghostSlot&&ghostSlot.date===day&&(()=>{
                  const gy=timeToY(ghostSlot.time);
                  const gh=Math.max(20,durationToH(ghostSlot.time,ghostSlot.endTime));
                  return <div style={{position:"absolute",top:gy+1,left:1,right:1,height:gh-2,background:"rgba(245,201,122,0.35)",border:"1.5px dashed #F5C97A",borderRadius:6,pointerEvents:"none",zIndex:9,display:"flex",alignItems:"flex-start",padding:"3px 5px"}}>
                    <span style={{fontSize:9,color:"#7a4e0a",fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ghostSlot.time} → {ghostSlot.endTime}</span>
                  </div>;
                })()}
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
                      onTouchStart={e => {
                        if (isTask) return;
                        evPressFired.current = false;
                        // tap long réservé au futur drag & drop — ne déclenche plus le popover
                        evPressTimer.current = setTimeout(() => {
                          evPressFired.current = true;
                          // TODO drag & drop : initialiser ici
                        }, 450);
                      }}
                      onTouchMove={()=>{ if(evPressTimer.current){clearTimeout(evPressTimer.current);evPressTimer.current=null;} }}
                      onTouchEnd={(e) => {
                        if (evPressTimer.current) {
                          clearTimeout(evPressTimer.current);
                          evPressTimer.current = null;
                        }
                        // tap court → popover (tap long réservé au futur drag & drop)
                        if (!evPressFired.current) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPopover({
                            ev,
                            eventRect: {
                              top:    rect.top,
                              bottom: rect.bottom,
                              left:   rect.left,
                              right:  rect.right,
                              width:  rect.width,
                              height: rect.height
                            }
                          });
                        }
                        evPressFired.current = false;
                      }}
                      onClick={e=>{
                        e.stopPropagation();
                        if(evPressFired.current){evPressFired.current=false;return;}
                        if(isTask){setDrawerOpen(false);return;}
                        const rect = e.currentTarget.getBoundingClientRect();
                        setPopover({
                          ev,
                          eventRect: {
                            top:    rect.top,
                            bottom: rect.bottom,
                            left:   rect.left,
                            right:  rect.right,
                            width:  rect.width,
                            height: rect.height
                          }
                        });
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
        <EventPopoverNew ev={popover.ev} eventRect={popover.eventRect}
          onClose={()=>setPopover(null)}

onCopy={(ev) => {
  copyToClipboard(ev);
}}

          onEdit={()=>{setEditEv(popover.ev);setSlotPrefill(null);setFormOpen(true);setPopover(null);}}
          onDelete={()=>{handleDeleteEvent(popover.ev);setPopover(null);}}
        />
      )}

      <NomadTask
        tasks={tasks} drawerOpen={drawerOpen} setDrawerOpen={setDrawerOpen}
        swipeTaskId={swipeTaskId} setSwipeTaskId={setSwipeTaskId}
onTaskClick={t=>{
  setEditTask(t);
  setTaskFormOpen(true);
  setDrawerOpen(false);
}}
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
          return notes.filter(n=>n.periodId===cur.href&&n.periodId!=="pending").length;
        } catch { return 0; } })()}
        onOpenNomadFeed={()=>alert("NomadFeed — bientôt disponible ! 🚀")}
      />

      {formOpen && (
        <EventForm initial={editEv||slotPrefill} calendars={calendars} defaultCalHref={settings.defaultCalHref} saving={saving} onCancel={()=>{setFormOpen(false);setEditEv(null);setSlotPrefill(null);}} onSave={async ev=>{
  if(saving) return;
const wasEdit = !!editEv;
// Édition d'UNE occurrence récurrente ("cet événement uniquement") → exception RFC 5545
const isOccEdit = wasEdit && editEv?.isRecurring && ev.editMode === "this";
  setSaving(true);
// Instant ORIGINAL de l'occurrence, capturé AVANT que le form ne le remplace
const occMasterUid = editEv?.masterUid || (editEv?.id || "").split("_exc_")[0];
const occHref      = editEv?.href;
const occAllDay    = editEv?.allDay;
const occRidVal    = editEv?.recurrenceId
  || (editEv?.allDay
        ? (editEv?.startDate || "").replace(/-/g, "")
        : `${(editEv?.startDate || "").replace(/-/g, "")}T${(editEv?.startTime || "00:00").replace(":", "")}00`);
const newId = editEv?.id || `calflow-${Date.now()}`;
const newEv = {
  ...(editEv || {}),
  ...ev,
  id: newId,
  href: editEv?.href || (ev.calHref + newId + ".ics"),
  calColor: calendars.find(c => c.href === ev.calHref)?.color || C.accent,
  calName: calendars.find(c => c.href === ev.calHref)?.displayName || "",
  type: "event",
  ...(wasEdit ? { _pendingEdit: true } : { _pending: true }),
};

  setEvents(prev=>wasEdit?prev.map(e=>e.id===newId?newEv:e):[...prev,newEv]);
  setFormOpen(false); setEditEv(null);
  setSaving(false);

let pushResult;
if (isOccEdit) {
  const exEv = { ...newEv, masterUid: occMasterUid, href: occHref, recurrenceId: occRidVal, allDay: occAllDay };
  if (navigator.onLine) {
    pushResult = await pushOccurrenceException(exEv, auth);
  } else {
    // Hors-ligne : op "exception" en file, rejouée par flushQueue au retour réseau.
    // L'optimistic (_pendingEdit) reste en place pour afficher l'occurrence modifiée.
    enqueueWrite(auth.email, { op: "exception", ev: exEv });
    pushResult = { ok: false, queued: true };
  }
} else {
  pushResult = await pushEvent(newEv, auth);
}
if (pushResult?.ok) {
  // runSync protégé : _pendingEdit reste actif pendant la sync, effacé après
  await runSync({ auth, flushQueue, syncCalDAV, onPutSuccess: clearPendingEdit, onDeleteSuccess: clearTombstone });
  if (wasEdit) {
    setEvents(prev => prev.map(e => e.id === newId ? { ...e, _pendingEdit: undefined } : e));
  }
}
// Si pushResult.ok === false : event protégé localement par _pendingEdit / _pending.
// La file d’attente ou le prochain cycle de sync s’en chargera.

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
  addTombstone(auth.email, confirmDel.id);
  const delResult = await deleteEvent(confirmDel, auth);
  if (delResult?.ok) {
    await runSync({ auth, flushQueue, syncCalDAV, onPutSuccess: clearPendingEdit, onDeleteSuccess: clearTombstone });
    removeTombstone(auth.email, confirmDel.id);
  }
  // Si delResult.ok est false : suppression en file d'attente (offline ou 403),
  // la tombe reste plantée — flushQueue + clearTombstone la retireront plus tard.
} catch (e) {
  console.error("delete failed", e);
}


              }

            }}>Supprimer</Btn>
          </div>
        </div>}
      </Modal>

{clipboard&&pasteTarget&&(
  <EventPopoverPaste
    clipboard={clipboard}
    eventRect={pasteTarget.eventRect}
    targetDate={pasteTarget.date}
    targetTime={pasteTarget.time}
    onGhostChange={setGhostSlot}
    calendars={calendars}
    onCancel={()=>{ setGhostSlot(null); setPasteTarget(null); }}
    onConfirm={async ({startDate,startTime,endDate,endTime,calHref})=>{
      const targetCalHref = calHref || clipboard.calHref;
      const pasteId = `calflow-${Date.now()}`;
      const newEv = {
        id: pasteId,
        href: targetCalHref + pasteId + ".ics",
        title: clipboard.title, allDay: clipboard.allDay, status: clipboard.status,
        calHref: targetCalHref,
        calColor: calendars.find(c=>c.href===targetCalHref)?.color || C.accent,
        calName:  calendars.find(c=>c.href===targetCalHref)?.displayName || "",
        location: clipboard.location, email: clipboard.email, tel: clipboard.tel,
        notes: clipboard.notes,
        startDate: startDate || pasteTarget.date, endDate: endDate || pasteTarget.date,
        startTime, endTime,
        type: "event",
        _pending: true,
      };
      setEvents(prev=>[...prev, newEv]);
      setGhostSlot(null);
      setClipboard(null);
      setPasteTarget(null);
      if (clipboardTimer.current) clearTimeout(clipboardTimer.current);
      await pushEvent(newEv, auth);
      await runSync({ auth, flushQueue, syncCalDAV, onPutSuccess: clearPendingEdit, onDeleteSuccess: clearTombstone });
    }}
  />
)}

      <Modal open={!!fraisDate} onClose={()=>setFraisDate(null)} title={`Frais du ${fraisDate||""}`}>
        <div style={{textAlign:"center",padding:"20px 0",color:C.muted,fontSize:14}}>
          Module Frais — bientôt disponible en Premium 🚀
        </div>
      </Modal>

     <FeedbackButton auth={auth} currentPage={nomadBookOpen ? "NomadBook" : "NomadCal"} />
     {settings.showDebugPanel && (
       <button onClick={()=>setScreen("debug")} style={{
         position:"fixed", bottom:178, right:16, zIndex:497,
         width:44, height:44, borderRadius:"50%",
         background: C.surface, border:`2px solid #8B5E20`,
         boxShadow:"0 4px 16px rgba(139,94,32,.3)",
         cursor:"pointer", display:"flex",
         alignItems:"center", justifyContent:"center",
         transition:"all .2s",
       }}>
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
           <rect x="3" y="4" width="18" height="16" rx="2" stroke="#8B5E20" strokeWidth="1.7"/>
           <path d="M7 8h4M7 12h8M7 16h5" stroke="#8B5E20" strokeWidth="1.5" strokeLinecap="round"/>
           <circle cx="18" cy="8" r="2.5" fill="#F5C97A"/>
         </svg>
       </button>
     )}

</div>
  </ToastProvider>
);
}
