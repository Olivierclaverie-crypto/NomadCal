import { useState, useEffect, useRef, useCallback } from "react";
import { C, PRIORITY, SYNTHESE_DEADLINES, GRID_START, GRID_END, GRID_TOTAL, SLOT_H, GRID_H, GRID_DEFAULT_SCROLL, RECURRENCE_OPTIONS } from "./utils/constants.js";
import { load, save, toISO, todayISO, getWeekStart, getWeekDays, fmtDay, fmtDayNum, fmtWeekRange, timeToMinutes, minutesToHHMM, timeToY, durationToH, slideTasksToToday, rruleToFr, makeAuthHeader } from "./utils/helpers.js";
import { caldavRequest, parseCalendars, parseEvents, expandRecurring } from "./utils/caldav.js";
import Modal, { Btn } from "./components/Modal.jsx";
import Header from "./components/Header.jsx";
import TaskDrawer from "./components/TaskDrawer.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import Settings from "./components/Settings.jsx";

async function pushEvent(ev, auth) {
  if (!auth || !ev.calHref) return;
  const uid = ev.id?.startsWith("calflow-") ? ev.id : `calflow-${Date.now()}@nomadcal`;
  const allDay = ev.allDay;
  const fmt = s => s ? s.replace(/-/g, "") : "";
  const dtstart = allDay ? `DTSTART;VALUE=DATE:${fmt(ev.startDate)}` : `DTSTART:${fmt(ev.startDate)}T${(ev.startTime||"09:00").replace(":","")+"00"}`;
  const dtend   = allDay ? `DTEND;VALUE=DATE:${fmt(ev.endDate||ev.startDate)}` : `DTEND:${fmt(ev.endDate||ev.startDate)}T${(ev.endTime||"10:00").replace(":","")+"00"}`;
  const ics = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//NomadCal//FR",
    "BEGIN:VEVENT",`UID:${uid}`,dtstart,dtend,
    `SUMMARY:${ev.title}`,
    ev.rrule&&!ev.isRecurring?`RRULE:${ev.rrule}`:"",
    ev.location?`LOCATION:${ev.location}`:"",
    ev.notes?`DESCRIPTION:${ev.notes.replace(/\n/g,"\\n")}`:"",
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}Z`,
    "END:VEVENT","END:VCALENDAR"
  ].filter(Boolean).join("\r\n");
  const path = ev.calHref + uid + ".ics";
  await caldavRequest("PUT", path, makeAuthHeader(auth.email, auth.appPassword), ics, {"Content-Type":"text/calendar; charset=utf-8"});
}

async function deleteEvent(ev, auth) {
  if (!auth || !ev.href) return;
  await caldavRequest("DELETE", ev.href, makeAuthHeader(auth.email, auth.appPassword));
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

function EventForm({ initial, calendars, onSave, onCancel, defaultCalHref }) {
  const [title,setTitle]       = useState(initial?.title||"");
  const [allDay,setAllDay]     = useState(initial?.allDay||false);
  const [startDate,setSD]      = useState(initial?.startDate||todayISO());
  const [endDate,setED]        = useState(initial?.endDate||todayISO());
  const [startTime,setST]      = useState(initial?.startTime||"09:00");
  const [endTime,setET]        = useState(initial?.endTime||"10:00");
  const [calHref,setCal]       = useState(initial?.calHref||defaultCalHref||calendars[0]?.href||"");
  const [location,setLoc]      = useState(initial?.location||"");
  const [notes,setNotes]       = useState(initial?.notes||"");
  const [rrule,setRrule]       = useState(initial?.rrule||"");
  const [editMode,setEditMode] = useState("this");
  const [status,setStatus]     = useState(initial?.status||"confirmed");

  const iStyle = { width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${C.border}`, background:C.bg, color:C.ink, fontSize:14, fontFamily:"inherit", outline:"none", marginBottom:10, boxSizing:"border-box" };
  const calColor = calendars.find(c=>c.href===calHref)?.color || C.accent;

  function save() {
    if (!title.trim()) return;
    onSave({title:title.trim(),allDay,startDate,startTime:allDay?null:startTime,endDate,endTime:allDay?null:endTime,calHref,location,notes,rrule,editMode,status});
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre…" style={{...iStyle,fontSize:16,fontWeight:700}} autoFocus/>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"2px 0"}}>
        <span style={{fontSize:14,color:C.ink}}>Jour entier</span>
        <div onClick={()=>setAllDay(a=>!a)} style={{width:44,height:26,borderRadius:13,background:allDay?C.green:C.border,cursor:"pointer",position:"relative",transition:"background .2s"}}>
          <div style={{position:"absolute",top:3,left:allDay?21:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
        </div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <div style={{flex:1}}><label style={{fontSize:11,color:C.muted,fontWeight:700,display:"block",marginBottom:4}}>DÉBUT</label><input type="date" value={startDate} onChange={e=>setSD(e.target.value)} style={iStyle}/></div>
        <div style={{flex:1}}><label style={{fontSize:11,color:C.muted,fontWeight:700,display:"block",marginBottom:4}}>FIN</label><input type="date" value={endDate} onChange={e=>setED(e.target.value)} style={iStyle}/></div>
      </div>
      {!allDay&&<div style={{display:"flex",gap:8}}>
        <div style={{flex:1}}><label style={{fontSize:11,color:C.muted,fontWeight:700,display:"block",marginBottom:4}}>HEURE DÉBUT</label><input type="time" value={startTime} onChange={e=>setST(e.target.value)} style={iStyle}/></div>
        <div style={{flex:1}}><label style={{fontSize:11,color:C.muted,fontWeight:700,display:"block",marginBottom:4}}>HEURE FIN</label><input type="time" value={endTime} onChange={e=>setET(e.target.value)} style={iStyle}/></div>
      </div>}
      <div>
        <label style={{fontSize:11,color:C.muted,fontWeight:700,display:"block",marginBottom:4}}>CALENDRIER</label>
        <select value={calHref} onChange={e=>setCal(e.target.value)} style={{...iStyle,borderColor:calColor,borderWidth:2,background:calColor+"15"}}>
          {calendars.map(c=><option key={c.href} value={c.href}>{c.displayName}</option>)}
        </select>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontWeight:700,display:"block",marginBottom:4}}>RÉCURRENCE <button onClick={()=>alert("🔁 Récurrence vs Tâche glissante\n\nLa RÉCURRENCE recrée l'événement à la fréquence choisie.\n\nLa TÂCHE GLISSANTE glisse au lendemain si non faite.")} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:"50%",width:16,height:16,fontSize:10,cursor:"pointer",color:C.muted}}>?</button></label>
        <select value={rrule} onChange={e=>setRrule(e.target.value)} style={iStyle}>
          {RECURRENCE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {initial?.rrule&&<div style={{display:"flex",gap:6}}>
        {[["this","Cet événement"],["following","Suivants"],["all","Tous"]].map(([v,l])=>(
          <button key={v} onClick={()=>setEditMode(v)} style={{flex:1,padding:"8px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${editMode===v?C.accent:C.border}`,background:editMode===v?C.accentLight:"transparent",color:editMode===v?C.accent:C.muted,fontSize:11,fontWeight:700}}>{l}</button>
        ))}
      </div>}
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setStatus("confirmed")} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${status==="confirmed"?C.green:C.border}`,background:status==="confirmed"?C.greenLight:"transparent",color:status==="confirmed"?C.green:C.muted,fontSize:12,fontWeight:700}}>✅ Confirmé</button>
        <button onClick={()=>setStatus("pending")} style={{flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${status==="pending"?"#F5A623":C.border}`,background:status==="pending"?"#FFF8ED":"transparent",color:status==="pending"?"#B8741A":C.muted,fontSize:12,fontWeight:700}}>🟠 À confirmer</button>
      </div>
      <div style={{position:"relative"}}>
        <input value={location} onChange={e=>setLoc(e.target.value)} placeholder="Adresse / Lieu" style={{...iStyle,paddingRight:36}}/>
        {location&&<button onClick={()=>{const a=encodeURIComponent(location);const w=confirm("OK = Plans Apple\nAnnuler = Waze/Google");if(w)window.open(`maps://?q=${a}`,"_blank");else{const g=confirm("OK = Waze\nAnnuler = Google Maps");if(g)window.open(`waze://?q=${a}&navigate=yes`,"_blank");else window.open(`https://maps.google.com/?q=${a}`,"_blank");}}} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-60%)",background:"none",border:"none",cursor:"pointer",fontSize:18}}>📍</button>}
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Notes (optionnel)" rows={3} style={{...iStyle,resize:"none",lineHeight:1.6}}/>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
        <Btn onClick={onCancel}>Annuler</Btn>
        <Btn onClick={save} variant="primary">Créer l'événement</Btn>
      </div>
    </div>
  );
}

function TaskForm({ initial, onSave, onCancel }) {
  const [title,setTitle]         = useState(initial?.title||"");
  const [notes,setNotes]         = useState(initial?.notes||"");
  const [priority,setPriority]   = useState(initial?.priority||"normal");
  const [effectiveDate,setEffDate] = useState(initial?.effectiveDate||todayISO());
  const [dueDate,setDueDate]     = useState(initial?.dueDate||"");
  const [recurrence,setRecur]    = useState(initial?.recurrence||"none");

  const iStyle = { width:"100%", padding:"10px 12px", borderRadius:10, border:`1.5px solid ${C.border}`, background:C.bg, color:C.ink, fontSize:14, fontFamily:"inherit", outline:"none", marginBottom:10, boxSizing:"border-box" };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre de la tâche…" style={{...iStyle,fontSize:16,fontWeight:700}} autoFocus/>
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
        <button onClick={()=>alert("🔁 Récurrence vs Tâche glissante\n\nLa RÉCURRENCE recrée la tâche à la fréquence choisie.\n\nLa TÂCHE GLISSANTE glisse au lendemain si non faite.")} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:"50%",width:16,height:16,fontSize:10,cursor:"pointer",color:C.muted}}>?</button>
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
        <Btn onClick={()=>{if(!title.trim())return;onSave({title:title.trim(),notes,priority,effectiveDate,dueDate,recurrence,type:"task",done:false,id:`task-${Date.now()}`,createdAt:new Date().toISOString()});}} variant="primary">Créer la tâche</Btn>
      </div>
    </div>
  );
}

function EventDetail({ ev, onEdit, onDelete, onShare, onCopy, onDone }) {
  if (!ev) return null;
  const isTask = ev.type === "task";
  const isSynthese = ev.id?.startsWith("synth-");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:20,fontWeight:800,color:C.ink,fontFamily:"Phenomena,sans-serif",lineHeight:1.3}}>{ev.title}</div>
      {ev.status==="pending"&&<div style={{fontSize:12,color:"#B8741A",background:"#FFF8ED",border:"1px solid #F5A623",borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:4}}>🟠 À confirmer</div>}
      {ev.isRecurring&&<div style={{fontSize:12,color:C.accent,background:C.accentLight,border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:4}}>🔁 Événement récurrent</div>}
      {ev.rrule&&!ev.isRecurring&&<div style={{fontSize:12,color:C.accent,background:C.accentLight,border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",display:"inline-flex",alignItems:"center",gap:4}}>🔁 {rruleToFr(ev.rrule)}</div>}
      <div style={{fontSize:14,color:C.muted}}>
        {ev.allDay ? `📅 ${ev.startDate}${ev.endDate&&ev.endDate!==ev.startDate?` → ${ev.endDate}`:""}` : `📅 ${ev.startDate} · ${ev.startTime} → ${ev.endTime}`}
      </div>
      {isTask&&ev.effectiveDate&&<div style={{fontSize:13,color:C.muted}}>↻ Apparaît le {ev.effectiveDate}</div>}
      {isTask&&ev.dueDate&&<div style={{fontSize:13,color:C.red}}>⚠ Échéance {ev.dueDate}</div>}
      {ev.location&&<div style={{fontSize:14,color:C.muted}}>📍 {ev.location}</div>}
      {ev.notes&&<div style={{fontSize:14,color:C.ink,lineHeight:1.65,whiteSpace:"pre-wrap",background:C.bg,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`}}>{ev.notes}</div>}
      {!isSynthese&&<>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
          <Btn onClick={onEdit} variant="soft" style={{flex:1}}>✎ Modifier</Btn>
          {!isTask&&<Btn onClick={onShare} variant="outline" style={{flex:1}}>↗ Partager</Btn>}
          <Btn onClick={onDelete} variant="danger" style={{flex:1}}>🗑 Supprimer</Btn>
        </div>
        {!isTask&&<Btn onClick={onCopy} variant="gold" style={{width:"100%",justifyContent:"center",display:"flex"}}>📋 Copier cet événement</Btn>}
        {isTask&&!ev.done&&<Btn onClick={onDone} variant="outline" style={{width:"100%",color:C.green,borderColor:C.green}}>✓ Marquer comme terminée</Btn>}
      </>}
    </div>
  );
}

export default function App() {
  const [auth,setAuth]             = useState(()=>load("cf_auth",null));
  const [events,setEvents]         = useState(()=>load("cf_events",[]));
  const [tasks,setTasks]           = useState(()=>load("cf_tasks",[]));
  const [calendars,setCalendars]   = useState(()=>load("cf_calendars",[]));
  const [settings,setSettings]     = useState(()=>load("cf_settings",{startHour:"8",endHour:"20",showDone:false}));
  const [weekStart,setWeekStart]   = useState(()=>getWeekStart(new Date()));
  const [screen,setScreen]         = useState("main");
  const [syncing,setSyncing]       = useState(false);
  const [syncOk,setSyncOk]         = useState(true);
  const [formOpen,setFormOpen]     = useState(false);
  const [taskFormOpen,setTaskFormOpen] = useState(false);
  const [detailEv,setDetailEv]     = useState(null);
  const [editEv,setEditEv]         = useState(null);
  const [editTask,setEditTask]     = useState(null);
  const [clipboard,setClipboard]   = useState(null);
  const [pasteTarget,setPasteTarget] = useState(null);
  const [confirmDel,setConfirmDel] = useState(null);
  const [confirmDone,setConfirmDone] = useState(null);
  const [drawerOpen,setDrawerOpen] = useState(false);
  const [swipeTaskId,setSwipeTaskId] = useState(null);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const gridScrollRef = useRef(null);

  const weekDays = getWeekDays(weekStart);

  useEffect(()=>{
    if(gridScrollRef.current){
      const scrollTo=(GRID_DEFAULT_SCROLL/GRID_TOTAL)*GRID_H;
      gridScrollRef.current.scrollTop=scrollTo;
    }
  },[]);

  useEffect(()=>save("cf_tasks",tasks),[tasks]);
  useEffect(()=>save("cf_events",events),[events]);
  useEffect(()=>save("cf_calendars",calendars),[calendars]);
  useEffect(()=>save("cf_settings",settings),[settings]);

  useEffect(()=>{
    const slide=()=>setTasks(prev=>slideTasksToToday(prev));
    slide();
    const now=new Date();
    const midnight=new Date(now);
    midnight.setHours(24,0,0,0);
    const t=setTimeout(slide,midnight-now);
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    const check=()=>{
      const in48h=new Date(Date.now()+48*60*60*1000);
      const in48hISO=toISO(in48h);
      const pending=events.filter(e=>e.status==="pending"&&e.startDate===in48hISO);
      if(pending.length>0){
        const titles=pending.map(e=>e.title).join(", ");
        if(window.confirm(`⚠️ RDV à confirmer dans 48h :\n${titles}\n\nVoulez-vous les confirmer ?`)){
          setEvents(prev=>prev.map(e=>pending.find(p=>p.id===e.id)?{...e,status:"confirmed"}:e));
        }
      }
    };
    check();
    const interval=setInterval(check,60*60*1000);
    return()=>clearInterval(interval);
  },[events]);

  useEffect(()=>{
    if(auth){
      const t=setTimeout(()=>syncCalDAV(),300);
      return()=>clearTimeout(t);
    }
  },[auth]);

  async function syncCalDAV(){
    if(!auth) return;
    setSyncing(true);
    try{
      const authHeader=makeAuthHeader(auth.email,auth.appPassword);
      const {text:principalXml}=await caldavRequest("PROPFIND","/1012673262/principal/",authHeader,`<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`,{Depth:"0"});
      const {text:calXml}=await caldavRequest("PROPFIND","/1012673262/calendars/",authHeader,`<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:a="http://apple.com/ns/ical/"><d:prop><d:displayname/><a:calendar-color/><d:resourcetype/></d:prop></d:propfind>`,{Depth:"1"});
      const cals=parseCalendars(calXml);
      setCalendars(cals);
      save("cf_calendars",cals);
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
      setEvents(allEvents);
      save("cf_events",allEvents);
      setSyncOk(true);
    }catch(e){
      setSyncOk(false);
    }
    setSyncing(false);
  }

  function handleLogin(email,password){
    const authObj={email,appPassword:password,auth:makeAuthHeader(email,password)};
    setAuth(authObj);
    save("cf_auth",authObj);
  }

  function doneTask(task){
    const completedAt=new Date().toISOString();
    const completedDate=toISO(new Date());
    const completedTime=new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
    setTasks(prev=>prev.map(t=>t.id===task.id?{...t,done:true,completedAt}:t));
    const doneEv={
      id:`done-${task.id}`,type:"task",done:true,
      title:task.title,startDate:completedDate,endDate:completedDate,
      startTime:completedTime,endTime:minutesToHHMM(timeToMinutes(completedTime)+30),
      calColor:C.green,calName:"Tâches",completedAt,
    };
    setEvents(prev=>[...prev,doneEv]);
  }

  function deleteTask(task){
    setTasks(prev=>prev.filter(t=>t.id!==task.id));
  }

  function handleTouchStart(e){ touchStartX.current=e.touches[0].clientX; touchStartY.current=e.touches[0].clientY; }
  function handleTouchEnd(e){
    if(!touchStartX.current) return;
    const dx=e.changedTouches[0].clientX-touchStartX.current;
    const dy=Math.abs(e.changedTouches[0].clientY-touchStartY.current);
    if(Math.abs(dx)>50&&dy<60){
      if(dx<0){const n=new Date(weekStart);n.setDate(n.getDate()+7);setWeekStart(n);}
      else{const n=new Date(weekStart);n.setDate(n.getDate()-7);setWeekStart(n);}
    }
    touchStartX.current=null;
  }

  if(!auth) return <LoginScreen onLogin={handleLogin}/>;
  if(screen==="settings") return <Settings settings={settings} setSettings={setSettings} calendars={calendars} onBack={()=>setScreen("main")} auth={auth}/>;

  const today=todayISO();
  const syntheseEvs=SYNTHESE_DEADLINES.map(s=>({id:`synth-${s.id}`,type:"event",allDay:true,title:s.label,startDate:s.date,endDate:s.date,calColor:"#2d7a4f",calName:"Synthèse"}));
  const allEvs=[...events,...syntheseEvs];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh",background:C.bg,overflow:"hidden",fontFamily:"Phenomena,Nunito,sans-serif"}}>
      <Header weekDays={weekDays} syncing={syncing} syncOk={syncOk} onSync={syncCalDAV} onSettings={()=>setScreen("settings")} onAddEvent={()=>{setEditEv(null);setFormOpen(true);}} clipboard={clipboard} onClearClipboard={()=>{setClipboard(null);setPasteTarget(null);}} tasks={tasks} onToggleDrawer={()=>setDrawerOpen(o=>!o)} weekStart={weekStart} onToday={()=>setWeekStart(getWeekStart(new Date()))} fmtWeekRange={fmtWeekRange}/>

      <div style={{display:"flex",background:C.surface,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <div style={{width:36,flexShrink:0}}/>
        {weekDays.map(day=>{
          const isToday=day===today;
          const hasDot=allEvs.some(e=>e.startDate===day||e.endDate===day);
          return(
            <div key={day} style={{flex:1,textAlign:"center",padding:"6px 0 4px"}}>
              <div style={{fontSize:10,color:isToday?C.accent:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{fmtDay(day)}</div>
              <div style={{width:28,height:28,borderRadius:"50%",background:isToday?C.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",margin:"2px auto"}}>
                <span style={{fontSize:14,fontWeight:700,color:isToday?"#fff":C.ink}}>{fmtDayNum(day)}</span>
              </div>
              {hasDot&&<div style={{width:4,height:4,borderRadius:"50%",background:C.accent,margin:"0 auto"}}/>}
            </div>
          );
        })}
      </div>

      {allEvs.some(e=>e.allDay&&weekDays.some(d=>d>=e.startDate&&d<=e.endDate))&&(
        <div style={{display:"flex",background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"4px 0",flexShrink:0}}>
          <div style={{width:36,flexShrink:0,fontSize:9,color:C.muted,textAlign:"center",paddingTop:4}}>Jour<br/>entier</div>
          <div style={{flex:1,position:"relative",minHeight:28}}>
            {allEvs.filter(e=>e.allDay&&weekDays.some(d=>d>=e.startDate&&d<=(e.endDate||e.startDate))).map(ev=>{
              const startIdx=Math.max(0,weekDays.indexOf(ev.startDate));
              const endIdx=Math.min(6,weekDays.findIndex(d=>d>(ev.endDate||ev.startDate))-1);
              const span=Math.max(1,(endIdx<0?7:endIdx+1)-startIdx);
              return(
                <div key={ev.id} onClick={()=>setDetailEv(ev)} style={{position:"relative",marginBottom:2,marginLeft:`${startIdx/7*100}%`,width:`${span/7*100}%`,background:ev.calColor+"22",border:`1.5px solid ${ev.calColor}`,borderRadius:6,padding:"2px 6px",cursor:"pointer",overflow:"hidden"}}>
                  <span style={{fontSize:10,fontWeight:700,color:ev.calColor,whiteSpace:"nowrap"}}>→ {ev.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div ref={gridScrollRef} style={{flex:1,overflowY:"auto",position:"relative"}}
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
            const dayTasks=tasks.filter(t=>(t.effectiveDate||t.createdAt?.slice(0,10))===day&&!t.done);
            const doneTasks=tasks.filter(t=>t.done&&t.startDate===day);
            const dayEvs=[...caldavEvs,...doneTasks];
            const nowPct=isToday?(new Date().getHours()*60+new Date().getMinutes())/GRID_TOTAL:null;
            return(
              <div key={day} style={{flex:1,borderLeft:`0.5px solid ${C.border}`,position:"relative",background:isToday?"#2B5A9E08":"transparent"}}
                onClick={e=>{
                  const rect=e.currentTarget.getBoundingClientRect();
                  const relY=e.clientY-rect.top;
                  const min=Math.round((relY/GRID_H)*GRID_TOTAL/30)*30;
                  const time=minutesToHHMM(Math.max(0,Math.min(GRID_END-30,min)));
                  if(clipboard){setPasteTarget({date:day,time});}
                  else{setEditEv(null);setFormOpen(true);}
                }}>
                {Array.from({length:24},(_,h)=>(
                  <div key={h} style={{position:"absolute",top:(h*60/GRID_TOTAL)*GRID_H,left:0,right:0,borderTop:h%1===0?`0.5px solid ${C.border}`:"none"}}/>
                ))}
                {nowPct&&<div style={{position:"absolute",top:`${nowPct*100}%`,left:0,right:0,height:2,background:C.red,zIndex:10}}><div style={{position:"absolute",left:-4,top:-3,width:8,height:8,borderRadius:"50%",background:C.red}}/></div>}
                {layoutEvents(dayEvs).map(ev=>{
                  const y=timeToY(ev.startTime||"09:00");
                  const h=Math.max(20,durationToH(ev.startTime||"09:00",ev.endTime||"10:00"));
                  const isTask=ev.type==="task";
                  const evColor=isTask?C.gold:(ev.calColor||C.accent);
                  const bg=isTask?C.goldLight:evColor;
                  function isLight(hex){const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return(r*299+g*587+b*114)/1000>128;}
                  const textC=isTask?C.goldDark:(isLight(evColor)?"#0F1D2B":"#ffffff");
                  const colW=100/(ev.totalCols||1);
                  const leftPct=(ev.col||0)*colW;
                  return(
                    <div key={ev.id+ev.col}
                      onClick={e=>{e.stopPropagation();setDetailEv(ev);}}
                      onDoubleClick={e=>{e.stopPropagation();setClipboard(ev);const t=document.createElement("div");t.textContent="📋 Copié !";t.style.cssText="position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#0F1D2B;color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;z-index:999;font-family:inherit";document.body.appendChild(t);setTimeout(()=>t.remove(),2000);}}
                      style={{position:"absolute",top:y+1,left:`${leftPct+0.5}%`,width:`${colW-1}%`,height:h-2,background:bg,border:`1.5px solid ${ev.status==="pending"?"#F5A623":evColor}`,borderRadius:6,padding:"3px 4px",cursor:"pointer",overflow:"hidden",opacity:ev.done?.6:1,transition:"opacity .2s",borderLeft:`3px solid ${ev.status==="pending"?"#F5A623":evColor}`,boxSizing:"border-box"}}>
                      {ev.status==="pending"&&<div style={{position:"absolute",top:2,right:2,width:6,height:6,borderRadius:"50%",background:"#F5A623"}}/>}
                      <div style={{fontSize:10,fontWeight:800,color:textC,lineHeight:1.3,textDecoration:ev.done?"line-through":"none"}}>
                        {isTask&&<span style={{marginRight:2}}>{ev.done?"✓ ":"↻ "}</span>}
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

      {/* Tiroir tâches — correction bug écran blanc */}
      <TaskDrawer
        tasks={tasks}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        swipeTaskId={swipeTaskId}
        setSwipeTaskId={setSwipeTaskId}
        onTaskClick={t=>{
          setDrawerOpen(false);
          setTimeout(()=>setDetailEv({...t,type:"task"}),50);
        }}
        onTaskDone={t=>setConfirmDone(t)}
        onTaskDelete={t=>setConfirmDel({...t,type:"task"})}
        onAddTask={()=>setTaskFormOpen(true)}
      />

      <Modal open={formOpen} onClose={()=>{setFormOpen(false);setEditEv(null);}} title={editEv?"Modifier l'événement":"+ Nouvel événement"}>
        <EventForm initial={editEv} calendars={calendars} defaultCalHref={settings.defaultCalHref} onCancel={()=>{setFormOpen(false);setEditEv(null);}} onSave={async ev=>{const newEv={...ev,id:editEv?.id||`calflow-${Date.now()}`,calColor:calendars.find(c=>c.href===ev.calHref)?.color||C.accent,calName:calendars.find(c=>c.href===ev.calHref)?.displayName||"",type:"event"};setEvents(prev=>editEv?prev.map(e=>e.id===editEv.id?newEv:e):[...prev,newEv]);await pushEvent(newEv,auth);setFormOpen(false);setEditEv(null);}}/>
      </Modal>

      <Modal open={taskFormOpen} onClose={()=>{setTaskFormOpen(false);setEditTask(null);}} title={editTask?"Modifier la tâche":"↻ Nouvelle tâche glissante"}>
        <TaskForm initial={editTask} onCancel={()=>{setTaskFormOpen(false);setEditTask(null);}} onSave={task=>{setTasks(prev=>editTask?prev.map(t=>t.id===editTask.id?{...task,id:editTask.id}:t):[...prev,task]);setTaskFormOpen(false);setEditTask(null);}}/>
      </Modal>

      <Modal open={!!detailEv} onClose={()=>setDetailEv(null)} title={detailEv?.type==="task"?"Tâche glissante":"Événement"}>
        <EventDetail ev={detailEv} onEdit={()=>{if(detailEv?.type==="task"){setEditTask(detailEv);setTaskFormOpen(true);}else{setEditEv(detailEv);setFormOpen(true);}setDetailEv(null);}} onDelete={()=>{setConfirmDel(detailEv);setDetailEv(null);}} onShare={()=>{if(navigator.share)navigator.share({title:detailEv?.title,text:`${detailEv?.startDate} ${detailEv?.startTime||""} — ${detailEv?.title}`});}} onCopy={()=>{setClipboard(detailEv);setDetailEv(null);}} onDone={()=>{setConfirmDone(detailEv);setDetailEv(null);}}/>
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

      <Modal open={!!confirmDel} onClose={()=>setConfirmDel(null)} title="🗑 Confirmer la suppression">
        {confirmDel&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{fontSize:14,color:C.muted}}>Supprimer <strong>{confirmDel.title}</strong> ?</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setConfirmDel(null)}>Annuler</Btn>
            <Btn variant="danger" onClick={async()=>{
              if(confirmDel.type==="task") deleteTask(confirmDel);
              else{setEvents(prev=>prev.filter(e=>e.id!==confirmDel.id));await deleteEvent(confirmDel,auth);}
              setConfirmDel(null);
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
            <Btn variant="primary" onClick={async()=>{
              const duration=timeToMinutes(clipboard.endTime||"10:00")-timeToMinutes(clipboard.startTime||"09:00");
              const newEv={...clipboard,id:`calflow-${Date.now()}`,masterUid:undefined,isRecurring:false,startDate:pasteTarget.date,endDate:pasteTarget.date,startTime:pasteTarget.time,endTime:minutesToHHMM(timeToMinutes(pasteTarget.time)+Math.max(30,duration))};
              setEvents(prev=>[...prev,newEv]);
              await pushEvent(newEv,auth);
              setClipboard(null);setPasteTarget(null);
            }}>Coller ici</Btn>
          </div>
        </div>}
      </Modal>
    </div>
  );
}
