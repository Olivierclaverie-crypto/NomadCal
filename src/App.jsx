import { useState, useEffect, useRef, useCallback } from "react";

// ── Design tokens — Home blue warm ───────────────────────────────────────────
const C = {
  bg:          "#fdf8f0",
  surface:     "#ffffff",
  card:        "#fffcf7",
  border:      "#e8d9c0",
  accent:      "#2B5A9E",
  accentLight: "#eaf1fb",
  accentBorder:"#BAD6F0",
  ink:         "#0F1D2B",
  muted:       "#5a6e7f",
  subtle:      "#8B5E20",
  gold:        "#F5C97A",
  goldLight:   "#fdf8ed",
  goldDark:    "#7a4e0a",
  green:       "#2d7a4f",
  greenLight:  "#edf7f1",
  red:         "#c0392b",
  redLight:    "#fdf0ef",
};

// ── Deadlines Synthèse NotesFlow ─────────────────────────────────────────────
const SYNTHESE_DEADLINES = [
  { id:"s1", date:"2026-06-01", label:"Synthèse Mai" },
  { id:"s2", date:"2026-07-06", label:"Synthèse Juin–Juillet" },
  { id:"s3", date:"2026-09-07", label:"Synthèse Juil–Août" },
  { id:"s4", date:"2026-10-05", label:"Synthèse Sept–Oct" },
  { id:"s5", date:"2026-11-02", label:"Synthèse Oct–Nov" },
  { id:"s6", date:"2026-12-07", label:"Synthèse Nov–Déc" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const toISO   = d => d.toISOString().slice(0,10);
const todayISO = () => toISO(new Date());
const load = (k,def) => { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } };
const save = (k,v)   => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  // Semaine commence le lundi (1) termine le dimanche (0→7)
  d.setDate(d.getDate() - (day===0?6:day-1));
  d.setHours(0,0,0,0);
  return d;
}

function getWeekDays(weekStart) {
  return Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate()+i);
    return toISO(d);
  });
}

function fmtDay(iso) {
  const d = new Date(iso+"T12:00:00");
  return d.toLocaleDateString("fr-FR",{weekday:"short"}).slice(0,3);
}
function fmtDayNum(iso) {
  return new Date(iso+"T12:00:00").getDate();
}
function fmtMonth(iso) {
  return new Date(iso+"T12:00:00").toLocaleDateString("fr-FR",{month:"short"});
}
function fmtWeekRange(days) {
  const a = new Date(days[0]+"T12:00:00");
  const b = new Date(days[6]+"T12:00:00");
  const ma = a.toLocaleDateString("fr-FR",{month:"long"});
  const mb = b.toLocaleDateString("fr-FR",{month:"long"});
  const y  = b.getFullYear();
  // Afficher uniquement le(s) mois — pas de redondance avec les jours
  if(ma===mb) return `${ma.charAt(0).toUpperCase()+ma.slice(1)} ${y}`;
  return `${ma.charAt(0).toUpperCase()+ma.slice(1)} – ${mb.charAt(0).toUpperCase()+mb.slice(1)} ${y}`;
}

function timeToMinutes(hhmm) {
  const [h,m] = hhmm.split(":").map(Number);
  return h*60+(m||0);
}
function minutesToHHMM(min) {
  const h = Math.floor(min/60).toString().padStart(2,"0");
  const m = (min%60).toString().padStart(2,"0");
  return `${h}:${m}`;
}

const GRID_START = 0;      // 0h — grille complète 24h
const GRID_END   = 24*60;  // 24h
const GRID_TOTAL = GRID_END - GRID_START; // 1440 min
const SLOT_H     = 56; // px par heure
const GRID_H     = (GRID_TOTAL/60)*SLOT_H; // 1344px
const GRID_DEFAULT_SCROLL = 8*60; // scroll initial à 8h

function timeToY(hhmm) {
  const min = timeToMinutes(hhmm);
  return ((min - GRID_START)/GRID_TOTAL)*GRID_H;
}
function durationToH(startHHMM, endHHMM) {
  const diff = timeToMinutes(endHHMM) - timeToMinutes(startHHMM);
  return (diff/GRID_TOTAL)*GRID_H;
}

// ── CalDAV helpers ────────────────────────────────────────────────────────────
function makeAuthHeader(email, appPassword) {
  return "Basic " + btoa(`${email}:${appPassword}`);
}

async function caldavRequest(method, path, auth, body="", extraHeaders={}) {
  const res = await fetch(`/api/caldav?path=${encodeURIComponent(path)}`, {
    method,
    headers: {
      "Authorization": auth,
      "Content-Type": "application/xml; charset=utf-8",
      ...extraHeaders,
    },
    body: method==="GET"||method==="HEAD" ? undefined : body,
  });
  const text = await res.text();
  return { status: res.status, text };
}

function parseCalendars(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const responses = doc.querySelectorAll("response");
  const cals = [];
  responses.forEach(r => {
    const href = r.querySelector("href")?.textContent || "";
    const displayName = r.querySelector("displayname")?.textContent || href.split("/").filter(Boolean).pop() || "Sans nom";
    const color = r.querySelector("calendar-color")?.textContent || "#2B5A9E";
    const isCalendar = r.querySelector("resourcetype calendar") !== null;
    if(isCalendar && href) {
      cals.push({ href, displayName, color: color.slice(0,7) });
    }
  });
  return cals;
}

function parseEvents(xml, calHref, calColor, calName) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const responses = doc.querySelectorAll("response");
  const events = [];
  responses.forEach(r => {
    const href = r.querySelector("href")?.textContent || "";
    const calData = r.querySelector("calendar-data")?.textContent || "";
    if(!calData) return;
    try {
      const ev = parseICS(calData, href, calHref, calColor, calName);
      if(ev) events.push(ev);
    } catch(e) {}
  });
  return events;
}

// ── Parser ICS ───────────────────────────────────────────────────────────────
function parseICS(ics, href, calHref, calColor, calName) {
  const lines = ics.replace(/\r\n /g,"").replace(/\r\n/g,"\n").split("\n");
  const get = key => {
    const line = lines.find(l=>l.startsWith(key+":") || l.startsWith(key+";"));
    if(!line) return null;
    return line.replace(/^[^:]+:/,"").trim();
  };
  const getAll = key => lines
    .filter(l=>l.startsWith(key+":") || l.startsWith(key+";"))
    .map(l=>l.replace(/^[^:]+:/,"").trim());

  const uid     = get("UID");
  const summary = get("SUMMARY") || "(sans titre)";
  const dtstart = get("DTSTART");
  const dtend   = get("DTEND");
  const loc     = get("LOCATION") || "";
  const desc    = get("DESCRIPTION") || "";
  const rrule   = get("RRULE") || "";
  const exdates = getAll("EXDATE").map(s=>s.slice(0,8)).map(s=>
    s.slice(0,4)+"-"+s.slice(4,6)+"-"+s.slice(6,8));

  if(!uid || !dtstart) return null;

  const allDay = dtstart.replace(/;[^:]+/,"").length===8 || dtstart.includes("VALUE=DATE");
  const parseDate = s => {
    if(!s) return null;
    const clean = s.replace(/;[^:]*:/,"").replace(/Z$/,"");
    if(clean.length===8) return clean.slice(0,4)+"-"+clean.slice(4,6)+"-"+clean.slice(6,8);
    const y=clean.slice(0,4), mo=clean.slice(4,6), d=clean.slice(6,8);
    const h=clean.slice(9,11)||"00", mi=clean.slice(11,13)||"00";
    return { date: `${y}-${mo}-${d}`, time: `${h}:${mi}` };
  };

  const start = parseDate(dtstart);
  const end   = parseDate(dtend);

  return {
    id: uid,
    href,
    calHref,
    calColor,
    calName,
    title: summary,
    allDay,
    startDate: allDay ? start : start.date,
    startTime: allDay ? null  : start.time,
    endDate:   allDay ? (typeof end==="string"?end:(end?.date||start)) : end?.date,
    endTime:   allDay ? null  : end?.time,
    location:  loc,
    notes:     desc.replace(/\\n/g,"\n"),
    rrule,
    exdates,
    type: "event",
  };
}

// ── Expansion des récurrences ─────────────────────────────────────────────────
function expandRecurring(ev, rangeStart, rangeEnd) {
  if(!ev.rrule) return [ev];

  const occurrences = [];
  const params = {};
  ev.rrule.split(";").forEach(p=>{
    const [k,v] = p.split("=");
    params[k] = v;
  });

  const freq    = params.FREQ;
  const count   = params.COUNT ? parseInt(params.COUNT) : 500;
  const until   = params.UNTIL ? params.UNTIL.slice(0,8) : null;
  const interval= params.INTERVAL ? parseInt(params.INTERVAL) : 1;
  const byDay   = params.BYDAY ? params.BYDAY.split(",") : null;

  // Durée de l'événement en ms
  const startD  = new Date(ev.startDate+"T"+(ev.startTime||"00:00")+":00");
  const endD    = new Date((ev.endDate||ev.startDate)+"T"+(ev.endTime||ev.startTime||"00:00")+":00");
  const duration= endD - startD;

  let current = new Date(startD);
  let n = 0;

  const toISO = d => d.toISOString().slice(0,10);
  const toTime = d => d.toTimeString().slice(0,5);

  // Jours de la semaine pour BYDAY
  const DAYS = ["SU","MO","TU","WE","TH","FR","SA"];

  while(n < count) {
    const curISO = toISO(current);

    // Stop si dépassé UNTIL ou rangeEnd (+ 1 an buffer)
    if(until && curISO > until.slice(0,4)+"-"+until.slice(4,6)+"-"+until.slice(6,8)) break;
    if(curISO > rangeEnd) break;

    // Vérifier BYDAY pour WEEKLY
    let matchesDay = true;
    if(byDay && freq==="WEEKLY"){
      const dayCode = DAYS[current.getDay()];
      matchesDay = byDay.some(d=>d.includes(dayCode));
    }

    if(matchesDay && curISO >= rangeStart && !ev.exdates?.includes(curISO)) {
      const occEnd = new Date(current.getTime() + duration);
      occurrences.push({
        ...ev,
        id: `${ev.id}_${curISO}`,
        startDate: curISO,
        startTime: ev.allDay ? null : toTime(current),
        endDate: toISO(occEnd),
        endTime: ev.allDay ? null : toTime(occEnd),
        isRecurring: true,
        masterUid: ev.id,
        recurrenceDate: curISO,
      });
      n++;
    }

    // Avancer selon la fréquence
    const next = new Date(current);
    switch(freq){
      case "DAILY":
        next.setDate(next.getDate() + interval);
        break;
      case "WEEKLY":
        if(byDay && byDay.length > 1){
          // Multi-jours : avancer jour par jour
          next.setDate(next.getDate() + 1);
        } else {
          next.setDate(next.getDate() + 7 * interval);
        }
        break;
      case "MONTHLY":
        next.setMonth(next.getMonth() + interval);
        break;
      case "YEARLY":
        next.setFullYear(next.getFullYear() + interval);
        break;
      default:
        next.setDate(next.getDate() + 7);
    }
    current = next;

    // Sécurité anti-boucle infinie
    if(n > 1000) break;
  }

  return occurrences.length > 0 ? occurrences : [ev];
}

// ── Tâches glissantes ─────────────────────────────────────────────────────────
const PRIORITY = {
  high:   { icon:"🔴", label:"Chaud devant !",    color:C.red,    bg:C.redLight },
  normal: { icon:"🟡", label:"C'est pour aujourd'hui", color:C.subtle, bg:"#fdf3e3"  },
  low:    { icon:"🟢", label:"Quand tu peux…",    color:C.green,  bg:C.greenLight },
};

function slideTasksToToday(tasks) {
  const t = todayISO();
  return tasks.map(task => {
    if(task.done) return task;
    const eff = task.effectiveDate || task.createdAt?.slice(0,10);
    if(eff && eff < t) return { ...task, effectiveDate: t };
    return task;
  });
}

// ── Composants UI ─────────────────────────────────────────────────────────────
// ── Helper RRULE → français ──────────────────────────────────────────────────
function rruleToFr(rrule){
  if(!rrule) return "";
  const p={};
  rrule.split(";").forEach(x=>{const[k,v]=x.split("=");p[k]=v;});
  const interval = p.INTERVAL||"1";
  switch(p.FREQ){
    case "DAILY":   return interval==="1"?"Quotidien":`Tous les ${interval} jours`;
    case "WEEKLY":
      if(p.BYDAY==="MO,TU,WE,TH,FR") return "Lun–Ven (jours ouvrés)";
      return interval==="1"?"Hebdomadaire":`Toutes les ${interval} semaines`;
    case "MONTHLY": return interval==="1"?"Mensuel":`Tous les ${interval} mois`;
    case "YEARLY":  return "Annuel";
    default: return "Récurrent";
  }
}

function Btn({onClick,children,variant="ghost",style={},disabled=false}){
  const base={border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",
    borderRadius:8,fontSize:13,fontWeight:700,padding:"8px 16px",transition:"all .15s",
    opacity:disabled?.4:1,letterSpacing:.3};
  const v={
    ghost:  {background:"transparent",color:C.muted},
    primary:{background:C.accent,color:"#fff",boxShadow:`0 2px 10px ${C.accent}44`},
    outline:{background:"transparent",color:C.accent,border:`1.5px solid ${C.accent}`},
    soft:   {background:C.accentLight,color:C.accent,border:`1px solid ${C.accentBorder}`},
    danger: {background:C.redLight,color:C.red,border:`1px solid ${C.red}44`},
    gold:   {background:C.goldLight,color:C.goldDark,border:`1px solid ${C.gold}88`},
  };
  return <button onClick={disabled?undefined:onClick} style={{...base,...v[variant],...style}}>{children}</button>;
}

function Modal({open,onClose,title,children}){
  if(!open) return null;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(15,29,43,.6)",backdropFilter:"blur(4px)",
      zIndex:400,display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onClick={onClose}>
      <div style={{background:C.surface,borderRadius:"20px 20px 0 0",padding:"20px 20px 40px",
        width:"100%",maxWidth:520,maxHeight:"92vh",overflowY:"auto",
        boxShadow:"0 -8px 40px rgba(0,0,0,.25)"}}
        onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,background:C.border,borderRadius:2,margin:"0 auto 18px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontWeight:700,fontSize:16,color:C.ink,fontFamily:"Phenomena,Nunito,sans-serif"}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,
            cursor:"pointer",fontSize:20,lineHeight:1,padding:4}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const iStyle = {
  background:C.bg,border:`1.5px solid ${C.border}`,color:C.ink,
  padding:"10px 14px",borderRadius:10,fontSize:14,outline:"none",
  fontFamily:"inherit",width:"100%",boxSizing:"border-box",transition:"border .15s",
};

// ── Formulaire Événement ──────────────────────────────────────────────────────
function EventForm({initial,calendars,defaultCalHref,onSave,onCancel}){
  const [title,setTitle]       = useState(initial?.title||"");
  const [allDay,setAllDay]     = useState(initial?.allDay||false);
  const [startDate,setStartDate]= useState(initial?.startDate||todayISO());
  const [startTime,setStartTime]= useState(initial?.startTime||"09:00");
  const [endDate,setEndDate]   = useState(initial?.endDate||todayISO());
  const [endTime,setEndTime]   = useState(initial?.endTime||"10:00");
  const [calHref,setCalHref]   = useState(initial?.calHref||defaultCalHref||calendars[0]?.href||"");
  const [location,setLocation] = useState(initial?.location||"");
  const [notes,setNotes]       = useState(initial?.notes||"");
  const [rrule,setRrule]       = useState(initial?.rrule||"");
  const [editMode,setEditMode] = useState("this");
  const [status,setStatus]     = useState(initial?.status||"confirmed"); // confirmed | pending // this | all | following

  const RECURRENCE_OPTIONS = [
    { value:"",                                          label:"Aucune" },
    { value:"FREQ=DAILY;INTERVAL=1",                    label:"Quotidienne" },
    { value:"FREQ=WEEKLY;INTERVAL=1",                   label:"Hebdomadaire" },
    { value:"FREQ=WEEKLY;INTERVAL=2",                   label:"Toutes les 2 semaines" },
    { value:"FREQ=MONTHLY;INTERVAL=1",                  label:"Mensuelle (même date)" },
    { value:"FREQ=MONTHLY;BYDAY=1MO",                   label:"1er lundi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=2MO",                   label:"2ème lundi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=3MO",                   label:"3ème lundi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=1TU",                   label:"1er mardi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=2TU",                   label:"2ème mardi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=1WE",                   label:"1er mercredi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=2WE",                   label:"2ème mercredi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=1TH",                   label:"1er jeudi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=2TH",                   label:"2ème jeudi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=1FR",                   label:"1er vendredi du mois" },
    { value:"FREQ=MONTHLY;BYDAY=2FR",                   label:"2ème vendredi du mois" },
    { value:"FREQ=YEARLY;INTERVAL=1",                   label:"Annuelle" },
    { value:"FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",        label:"Lun–Ven (jours ouvrés)" },
  ];

  function save(){
    if(!title.trim()) return;
    onSave({title:title.trim(),allDay,startDate,startTime:allDay?null:startTime,
      endDate,endTime:allDay?null:endTime,calHref,location,notes,rrule,editMode,status});
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre…" autoFocus
        style={{...iStyle,fontSize:15,fontWeight:700}}/>

      {/* Toggle jour entier */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",
        background:C.bg,borderRadius:10,border:`1.5px solid ${C.border}`}}>
        <span style={{fontSize:14,color:C.ink,flex:1}}>Jour entier</span>
        <div onClick={()=>setAllDay(a=>!a)} style={{width:44,height:26,borderRadius:13,
          background:allDay?C.accent:C.border,cursor:"pointer",position:"relative",transition:"background .2s"}}>
          <div style={{position:"absolute",top:3,left:allDay?21:3,width:20,height:20,
            borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
        </div>
      </div>

      {/* Dates */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Début</label>
          <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} style={iStyle}/>
        </div>
        <div>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Fin</label>
          <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} style={iStyle}/>
        </div>
      </div>

      {!allDay&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Heure début</label>
            <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} style={iStyle}/>
          </div>
          <div>
            <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Heure fin</label>
            <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} style={iStyle}/>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div>
        <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Calendrier</label>
        <select value={calHref} onChange={e=>setCalHref(e.target.value)}
          style={{...iStyle,
            borderColor: calendars.find(c=>c.href===calHref)?.color||C.border,
            borderWidth:2,
            background: (calendars.find(c=>c.href===calHref)?.color||C.accent)+"15"
          }}>
          {calendars.map(c=>(
            <option key={c.href} value={c.href}>{c.displayName}</option>
          ))}
        </select>
      </div>

      {/* Récurrence */}
      <div>
        <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:6,fontWeight:700,
          textTransform:"uppercase",letterSpacing:.5,display:"flex",alignItems:"center",gap:6}}>
          Récurrence
          <button onClick={()=>alert("🔁 Récurrence vs Tâche glissante\n\nLa RÉCURRENCE recrée automatiquement l'événement à la fréquence choisie.\n\nLa TÂCHE GLISSANTE glisse au lendemain si non faite — elle ne se duplique pas, elle se décale.")}
            style={{background:"none",border:`1px solid ${C.border}`,borderRadius:"50%",
              width:16,height:16,fontSize:10,cursor:"pointer",color:C.muted,
              display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            ?
          </button>
        </label>
        <select value={rrule} onChange={e=>setRrule(e.target.value)} style={{...iStyle}}>
          {RECURRENCE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Mode édition si récurrent existant */}
      {initial?.rrule&&(
        <div>
          <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Modifier</label>
          <div style={{display:"flex",gap:6}}>
            {[["this","Cet événement"],["following","Celui-ci et suivants"],["all","Tous"]].map(([v,l])=>(
              <button key={v} onClick={()=>setEditMode(v)} style={{
                flex:1,padding:"8px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
                border:`1.5px solid ${editMode===v?C.accent:C.border}`,
                background:editMode===v?C.accentLight:"transparent",
                color:editMode===v?C.accent:C.muted,
                fontSize:11,fontWeight:700,transition:"all .15s",textAlign:"center"}}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Statut RDV */}
      <div style={{display:"flex",gap:8,marginBottom:4}}>
        <button onClick={()=>setStatus("confirmed")} style={{
          flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
          border:`1.5px solid ${status==="confirmed"?C.green:C.border}`,
          background:status==="confirmed"?C.greenLight:"transparent",
          color:status==="confirmed"?C.green:C.muted,
          fontSize:12,fontWeight:700,transition:"all .15s"}}>
          ✅ Confirmé
        </button>
        <button onClick={()=>setStatus("pending")} style={{
          flex:1,padding:"10px 8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
          border:`1.5px solid ${status==="pending"?"#F5A623":C.border}`,
          background:status==="pending"?"#FFF8ED":"transparent",
          color:status==="pending"?"#B8741A":C.muted,
          fontSize:12,fontWeight:700,transition:"all .15s"}}>
          🟠 À confirmer
        </button>
      </div>

      <div style={{position:"relative"}}>
        <input value={location} onChange={e=>setLocation(e.target.value)}
          placeholder="Adresse / Lieu" style={{...iStyle,paddingRight:36}}/>
        {location&&(
          <button onClick={()=>{
            const addr = encodeURIComponent(location);
            // Pop-up choix navigation
            const choice = confirm("Ouvrir dans :
OK = Plans Apple
Annuler = proposer Waze");
            if(choice){
              window.open(`maps://?q=${addr}`,"_blank");
            } else {
              const w = confirm("Waze ?
OK = Waze
Annuler = Google Maps");
              if(w) window.open(`waze://?q=${addr}&navigate=yes`,"_blank");
              else window.open(`https://maps.google.com/?q=${addr}`,"_blank");
            }
          }} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",
            background:"none",border:"none",cursor:"pointer",fontSize:18,padding:2}}>
            📍
          </button>
        )}
      </div>
      <textarea value={notes} onChange={e=>setNotes(e.target.value)}
        placeholder="Notes (optionnel)" rows={3}
        style={{...iStyle,resize:"none",lineHeight:1.6}}/>

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
        <Btn onClick={onCancel}>Annuler</Btn>
        <Btn onClick={save} variant="primary" disabled={!title.trim()}>
          {initial?"Modifier":"Créer l'événement"}
        </Btn>
      </div>
    </div>
  );
}

// ── Formulaire Tâche ──────────────────────────────────────────────────────────
function TaskForm({initial,onSave,onCancel}){
  const [title,setTitle]         = useState(initial?.title||"");
  const [content,setContent]     = useState(initial?.content||"");
  const [priority,setPriority]   = useState(initial?.priority||"normal");
  const [dueDate,setDueDate]     = useState(initial?.dueDate||"");
  const [recurrence,setRecurrence]=useState(initial?.recurrence||"none");
  const [effectiveDate,setEffDate]=useState(initial?.effectiveDate||todayISO());

  function save(){
    if(!title.trim()) return;
    onSave({title:title.trim(),content,priority,dueDate:dueDate||null,
      recurrence,effectiveDate});
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <input value={title} onChange={e=>setTitle(e.target.value)}
        placeholder="Titre de la tâche…" autoFocus style={{...iStyle,fontSize:15,fontWeight:700}}/>
      <textarea value={content} onChange={e=>setContent(e.target.value)}
        placeholder="Notes (optionnel)" rows={2} style={{...iStyle,resize:"none",lineHeight:1.6}}/>

      {/* Priorité */}
      <div>
        <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Priorité</label>
        <div style={{display:"flex",gap:8}}>
          {Object.entries(PRIORITY).map(([key,pr])=>(
            <button key={key} onClick={()=>setPriority(key)} style={{
              flex:1,padding:"8px 4px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",
              border:`1.5px solid ${priority===key?pr.color:C.border}`,
              background:priority===key?pr.bg:"transparent",
              color:priority===key?pr.color:C.muted,
              fontSize:12,fontWeight:700,transition:"all .15s",textAlign:"center"}}>
              <div style={{fontSize:16,marginBottom:2}}>{pr.icon}</div>
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date d'apparition */}
      <div>
        <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Apparaît le</label>
        <input type="date" value={effectiveDate} onChange={e=>setEffDate(e.target.value)} style={iStyle}/>
      </div>

      {/* Échéance */}
      <div>
        <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:4,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Échéance (optionnel)</label>
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} style={iStyle}/>
      </div>

      {/* Récurrence */}
      <div>
        <label style={{fontSize:11,color:C.muted,display:"block",marginBottom:8,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>Récurrence</label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["none","Aucune"],["daily","Quotidienne"],["weekly","Hebdomadaire"],["monthly","Mensuelle"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setRecurrence(id)} style={{
              padding:"6px 12px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",
              border:`1.5px solid ${recurrence===id?C.accent:C.border}`,
              background:recurrence===id?C.accentLight:"transparent",
              color:recurrence===id?C.accent:C.muted,
              fontSize:12,fontWeight:700,transition:"all .15s"}}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
        <Btn onClick={onCancel}>Annuler</Btn>
        <Btn onClick={save} variant="gold" disabled={!title.trim()}>
          {initial?"Modifier":"Créer la tâche"}
        </Btn>
      </div>
    </div>
  );
}

// ── Fiche détail événement ────────────────────────────────────────────────────
function EventDetail({ev,onEdit,onDelete,onClose,onShare,onCopy}){
  const isTask = ev.type==="task";
  const isSynthese = ev.type==="synthese";
  const pr = isTask ? PRIORITY[ev.priority||"normal"] : null;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Couleur bar */}
      <div style={{height:4,borderRadius:2,background:isTask?C.gold:isSynthese?C.green:(ev.calColor||C.accent),margin:"-4px 0 0"}}/>

      <div>
        <div style={{fontSize:18,fontWeight:800,color:C.ink,marginBottom:6,fontFamily:"Phenomena,sans-serif"}}>{ev.title}</div>
        {isTask&&pr&&(
          <span style={{fontSize:12,fontWeight:700,color:pr.color,background:pr.bg,
            padding:"2px 8px",borderRadius:20}}>{pr.icon} {pr.label}</span>
        )}
        {!isTask&&ev.calName&&(
          <span style={{fontSize:12,fontWeight:700,color:ev.calColor||C.accent,
            background:(ev.calColor||C.accent)+"18",padding:"2px 8px",borderRadius:20}}>
            {ev.calName}
          </span>
        )}
      </div>

      {/* Dates */}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {ev.allDay
          ? <div style={{fontSize:14,color:C.muted}}>
              📅 {ev.startDate===ev.endDate ? ev.startDate : `${ev.startDate} → ${ev.endDate}`}
              <span style={{marginLeft:8,fontSize:12,background:C.accentLight,color:C.accent,
                padding:"1px 6px",borderRadius:10}}>Jour entier</span>
            </div>
          : <div style={{fontSize:14,color:C.muted}}>
              📅 {ev.startDate} · {ev.startTime} → {ev.endTime}
            </div>
        }
        {isTask&&ev.effectiveDate&&(
          <div style={{fontSize:13,color:C.muted}}>↻ Apparaît le {ev.effectiveDate}</div>
        )}
        {isTask&&ev.dueDate&&(
          <div style={{fontSize:13,color:C.red}}>⚠ Échéance {ev.dueDate}</div>
        )}
        {isTask&&ev.done&&ev.completedAt&&(
          <div style={{fontSize:13,color:C.green}}>✓ Terminée le {new Date(ev.completedAt).toLocaleDateString("fr-FR")} à {new Date(ev.completedAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</div>
        )}
      </div>

      {ev.isRecurring&&(
        <div style={{fontSize:12,color:C.accent,background:C.accentLight,
          border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",
          display:"inline-flex",alignItems:"center",gap:4}}>
          🔁 Événement récurrent
        </div>
      )}
      {ev.rrule&&!ev.isRecurring&&(
        <div style={{fontSize:12,color:C.accent,background:C.accentLight,
          border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",
          display:"inline-flex",alignItems:"center",gap:4}}>
          🔁 {rruleToFr(ev.rrule)}
        </div>
      )}
      {isTask&&ev.recurrence&&ev.recurrence!=="none"&&(
        <div style={{fontSize:12,color:C.accent,background:C.accentLight,
          border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",
          display:"inline-flex",alignItems:"center",gap:4}}>
          🔁 {ev.recurrence==="daily"?"Quotidienne":ev.recurrence==="weekly"?"Hebdomadaire":ev.recurrence==="monthly"?"Mensuelle":"Récurrente"}
        </div>
      )}
      {ev.location&&(
        <div style={{fontSize:14,color:C.muted}}>📍 {ev.location}</div>
      )}
      {ev.notes&&(
        <div style={{fontSize:14,color:C.ink,lineHeight:1.65,whiteSpace:"pre-wrap",
          background:C.bg,borderRadius:10,padding:"10px 14px",border:`1px solid ${C.border}`}}>
          {ev.notes}
        </div>
      )}

      {/* Actions */}
      {!isSynthese&&(
        <>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:4}}>
            <Btn onClick={onEdit} variant="soft" style={{flex:1}}>✎ Modifier</Btn>
            {!isTask&&<Btn onClick={onShare} variant="outline" style={{flex:1}}>↗ Partager</Btn>}
            <Btn onClick={onDelete} variant="danger" style={{flex:1}}>🗑 Supprimer</Btn>
          </div>
          {!isTask&&(
            <div style={{marginTop:8}}>
              <Btn onClick={onCopy} variant="gold" style={{width:"100%",justifyContent:"center",display:"flex"}}>
                📋 Copier cet événement
              </Btn>
              <div style={{fontSize:11,color:"#8B5E20",textAlign:"center",marginTop:6}}>
                Après avoir copié → swipe vers le jour cible → tap sur le créneau → Coller
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Écran de connexion CalDAV ─────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [email,setEmail]       = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState("");

  async function tryLogin(){
    if(!email.trim()||!password.trim()) return;
    setLoading(true); setError("");
    try{
      const auth = makeAuthHeader(email.trim(), password.trim());
      const { status, text } = await caldavRequest(
        "PROPFIND", "/1012673262/principal/", auth,
        `<?xml version="1.0" encoding="UTF-8"?><d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`,
        { Depth:"0" }
      );
      // On valide la connexion si iCloud répond
      onLogin({ email:email.trim(), appPassword:password.trim(), auth });
    }catch(e){
      setError("Erreur de connexion : "+e.message);
    }
    setLoading(false);
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"32px 24px"}}>
      <div style={{marginBottom:32,textAlign:"center"}}>
        <div style={{fontSize:42,fontWeight:800,color:C.accent,fontFamily:"Phenomena,sans-serif",letterSpacing:-2,lineHeight:1}}>
          CalFlow
        </div>
        <div style={{fontSize:14,color:C.muted,marginTop:8}}>Calendrier terrain · iCloud sync</div>
      </div>

      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:14}}>
        <div style={{background:C.accentLight,border:`1px solid ${C.accentBorder}`,
          borderRadius:12,padding:"12px 16px",fontSize:13,color:C.accent,lineHeight:1.6}}>
          <strong>Mot de passe d'application Apple</strong><br/>
          Rendez-vous sur <strong>appleid.apple.com</strong> → Sécurité → Mots de passe d'application → Générer
        </div>

        <input value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="Email Apple (iCloud)"
          type="email" autoComplete="email"
          style={{...iStyle,fontSize:15}}/>

        <input value={password} onChange={e=>setPassword(e.target.value)}
          placeholder="Mot de passe d'application"
          type="password" autoComplete="current-password"
          onKeyDown={e=>{if(e.key==="Enter")tryLogin();}}
          style={{...iStyle,fontSize:15}}/>

        {error&&(
          <div style={{background:C.redLight,border:`1px solid ${C.red}44`,borderRadius:10,
            padding:"10px 14px",fontSize:13,color:C.red}}>
            {error}
          </div>
        )}

        <Btn onClick={tryLogin} variant="primary" disabled={loading||!email||!password}
          style={{padding:"14px",fontSize:15,marginTop:4}}>
          {loading?"Connexion en cours…":"Se connecter à iCloud"}
        </Btn>
      </div>
    </div>
  );
}

// ── Paramètres ────────────────────────────────────────────────────────────────
function SettingsScreen({calendars,settings,onSave,onLogout,onClose}){
  const [defaultCal,setDefaultCal] = useState(settings.defaultCal||"");
  const [gridStart,setGridStart]   = useState(settings.gridStart||8);
  const [gridEnd,setGridEnd]       = useState(settings.gridEnd||20);
  const [showDone,setShowDone]     = useState(settings.showDone??true);

  function save(){
    onSave({defaultCal,gridStart,gridEnd,showDone});
    onClose();
  }

  return(
    <div style={{minHeight:"100vh",background:C.bg,paddingBottom:40}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.accent,
          cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:"inherit"}}>← Retour</button>
        <span style={{flex:1,fontWeight:800,fontSize:17,color:C.ink,fontFamily:"Phenomena,sans-serif"}}>Paramètres</span>
        <Btn onClick={save} variant="primary" style={{padding:"6px 16px"}}>Enregistrer</Btn>
      </div>

      <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:24}}>
        {/* Affichage */}
        <section>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.8,
            textTransform:"uppercase",marginBottom:12}}>Affichage</div>

          <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
              <label style={{fontSize:13,color:C.muted,display:"block",marginBottom:6}}>Heure de début de grille</label>
              <select value={gridStart} onChange={e=>setGridStart(+e.target.value)} style={{...iStyle,width:"auto"}}>
                {[6,7,8].map(h=><option key={h} value={h}>{h}h00</option>)}
              </select>
            </div>
            <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
              <label style={{fontSize:13,color:C.muted,display:"block",marginBottom:6}}>Heure de fin de grille</label>
              <select value={gridEnd} onChange={e=>setGridEnd(+e.target.value)} style={{...iStyle,width:"auto"}}>
                {[20,21,22].map(h=><option key={h} value={h}>{h}h00</option>)}
              </select>
            </div>
            <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span style={{fontSize:13,color:C.ink}}>Afficher tâches terminées</span>
              <div onClick={()=>setShowDone(s=>!s)} style={{width:44,height:26,borderRadius:13,
                background:showDone?C.accent:C.border,cursor:"pointer",position:"relative",transition:"background .2s"}}>
                <div style={{position:"absolute",top:3,left:showDone?21:3,width:20,height:20,
                  borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
              </div>
            </div>
          </div>
        </section>

        {/* Calendriers */}
        <section>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.8,
            textTransform:"uppercase",marginBottom:12}}>Calendrier par défaut</div>
          <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            {calendars.map((cal,i)=>(
              <div key={cal.href} onClick={()=>setDefaultCal(cal.href)}
                style={{padding:"14px 16px",borderBottom:i<calendars.length-1?`1px solid ${C.border}`:"none",
                  display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
                <div style={{width:12,height:12,borderRadius:"50%",background:cal.color,flexShrink:0}}/>
                <span style={{flex:1,fontSize:14,color:C.ink}}>{cal.displayName}</span>
                {defaultCal===cal.href&&<span style={{color:C.accent,fontSize:16}}>✓</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Données */}
        <section>
          <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.8,
            textTransform:"uppercase",marginBottom:12}}>Données</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <Btn onClick={()=>{
              const tasks=load("cf_tasks",[]);
              const blob=new Blob([JSON.stringify(tasks,null,2)],{type:"application/json"});
              const url=URL.createObjectURL(blob);
              const a=document.createElement("a"); a.href=url; a.download="calflow_tasks.json"; a.click();
            }} variant="outline" style={{justifyContent:"flex-start"}}>📤 Exporter les tâches (JSON)</Btn>
            <Btn onClick={()=>{
              const tf=load("tf_tasks",[]);
              if(!tf.length){alert("Aucune donnée TaskFlow trouvée.");return;}
              const existing=load("cf_tasks",[]);
              const merged=[...existing,...tf.filter(t=>!existing.find(e=>e.id===t.id))];
              save("cf_tasks",merged);
              alert(`${tf.length} tâches importées depuis TaskFlow.`);
            }} variant="outline" style={{justifyContent:"flex-start"}}>📥 Importer depuis TaskFlow</Btn>
          </div>
        </section>

        {/* Déconnexion */}
        <Btn onClick={onLogout} variant="danger" style={{marginTop:8}}>
          Se déconnecter d'iCloud
        </Btn>
      </div>
    </div>
  );
}

// ── App principale ────────────────────────────────────────────────────────────
export default function CalFlow(){
  // Ref scroll grille
  const gridScrollRef = useRef(null);

  // Auth
  const [auth,setAuth]       = useState(()=>load("cf_auth",null));
  const [calendars,setCalendars]=useState(()=>load("cf_calendars",[]));
  const [settings,setSettings]=useState(()=>load("cf_settings",{
    defaultCal:"", gridStart:8, gridEnd:20, showDone:true
  }));

  // Vue
  const [weekStart,setWeekStart]=useState(()=>getWeekStart(new Date()));
  const [screen,setScreen]     = useState("calendar"); // calendar | settings

  // Événements
  const [events,setEvents]   = useState(()=>load("cf_events",[]));
  const [tasks,setTasks]     = useState(()=>slideTasksToToday(load("cf_tasks",[])));
  const [syncing,setSyncing] = useState(false);
  const [syncOk,setSyncOk]  = useState(true);

  // Modals
  const [formOpen,setFormOpen]       = useState(false);
  const [taskFormOpen,setTaskFormOpen]=useState(false);
  const [detailEv,setDetailEv]       = useState(null);
  const [editEv,setEditEv]           = useState(null);
  const [editTask,setEditTask]       = useState(null);
  const [confirmDel,setConfirmDel]   = useState(null);
  const [confirmDone,setConfirmDone] = useState(null); // tâche à confirmer terminée
  const [clipboard,setClipboard]     = useState(null); // événement copié
  const [pasteTarget,setPasteTarget] = useState(null); // {date, time}

  // Swipe
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Tiroir tâches
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [swipeTaskId, setSwipeTaskId] = useState(null); // pour swipe gauche supprimer

  const weekDays = getWeekDays(weekStart);

  // ── Scroll initial à 8h ──
  useEffect(()=>{
    if(gridScrollRef.current){
      const scrollTo = (GRID_DEFAULT_SCROLL/GRID_TOTAL)*GRID_H;
      gridScrollRef.current.scrollTop = scrollTo;
    }
  },[]);

  // ── Persistance ──
  useEffect(()=>save("cf_tasks",tasks),[tasks]);
  useEffect(()=>save("cf_events",events),[events]);
  useEffect(()=>save("cf_calendars",calendars),[calendars]);
  useEffect(()=>save("cf_settings",settings),[settings]);

  // ── Alerte 48h RDV à confirmer ──
  useEffect(()=>{
    const checkPending = () => {
      const now = new Date();
      const in48h = new Date(now.getTime() + 48*60*60*1000);
      const in48hISO = toISO(in48h);
      const pendingRDV = events.filter(ev=>
        ev.status==="pending" &&
        ev.startDate === in48hISO
      );
      if(pendingRDV.length>0){
        const titles = pendingRDV.map(e=>e.title).join(", ");
        if(window.confirm(`⚠️ RDV à confirmer dans 48h :
${titles}

Voulez-vous les confirmer maintenant ?`)){
          setEvents(prev=>prev.map(e=>
            pendingRDV.find(p=>p.id===e.id) ? {...e,status:"confirmed"} : e
          ));
        }
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 60*60*1000); // toutes les heures
    return()=>clearInterval(interval);
  },[events]);

  // ── Glissement minuit ──
  useEffect(()=>{
    const now=new Date();
    const msToMidnight=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1)-now;
    const timer=setTimeout(()=>{
      setTasks(prev=>slideTasksToToday(prev));
    },msToMidnight);
    return()=>clearTimeout(timer);
  },[]);

  // ── Sync CalDAV ──
  const syncCalDAV = useCallback(async()=>{
    if(!auth) return;
    setSyncing(true);
    try{
      // 1. Découvrir les calendriers — URL directe p126
      const { text: propText } = await caldavRequest(
        "PROPFIND",
        `/1012673262/calendars/`,
        auth.auth,
        `<?xml version="1.0"?><d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav" xmlns:a="http://apple.com/ns/ical/">
          <d:prop><d:displayname/><c:calendar-description/><a:calendar-color/><d:resourcetype/></d:prop>
        </d:propfind>`,
        { Depth:"1" }
      );
      const cals = parseCalendars(propText);
      if(cals.length) setCalendars(cals);

      // 2. Charger les événements de chaque calendrier (3 mois en arrière)
      const since = new Date(); since.setMonth(since.getMonth()-3);
      const sinceStr = since.toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";
      const until2 = new Date(); until2.setFullYear(until2.getFullYear()+1);
      const untilStr = until2.toISOString().replace(/[-:]/g,"").slice(0,15)+"Z";

      const allEvents = [];
      for(const cal of cals){
        try{
          const { text: evText } = await caldavRequest(
            "REPORT", cal.href, auth.auth,
            `<?xml version="1.0"?><c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
              <d:prop><d:getetag/><c:calendar-data/></d:prop>
              <c:filter><c:comp-filter name="VCALENDAR">
                <c:comp-filter name="VEVENT">
                  <c:time-range start="${sinceStr}" end="${untilStr}"/>
                </c:comp-filter>
              </c:comp-filter></c:filter>
            </c:calendar-query>`,
            { Depth:"1" }
          );
          const evs = parseEvents(evText, cal.href, cal.color, cal.displayName);
          // Expand les récurrences sur 3 mois en arrière + 1 an en avant
          const rStart = toISO(since);
          const rEnd = toISO(until2);
          evs.forEach(ev => {
            if(ev.rrule) {
              allEvents.push(...expandRecurring(ev, rStart, rEnd));
            } else {
              allEvents.push(ev);
            }
          });
        }catch(e){}
      }
      setEvents(allEvents);
      setSyncOk(true);
    }catch(e){
      setSyncOk(false);
    }
    setSyncing(false);
  },[auth]);

  useEffect(()=>{ if(auth) syncCalDAV(); },[auth]);

  // ── Push événement vers iCloud ──
  async function pushEvent(ev){
    if(!auth||!ev.calHref) return;
    const uid = ev.id || `calflow-${Date.now()}@calflow`;
    const dtstart = ev.allDay
      ? `DTSTART;VALUE=DATE:${ev.startDate.replace(/-/g,"")}`
      : `DTSTART:${ev.startDate.replace(/-/g,"")}T${(ev.startTime||"09:00").replace(":","00")}00Z`;
    const dtend = ev.allDay
      ? `DTEND;VALUE=DATE:${ev.endDate.replace(/-/g,"")}`
      : `DTEND:${ev.endDate.replace(/-/g,"")}T${(ev.endTime||"10:00").replace(":","00")}00Z`;

    const ics = [
      "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//CalFlow//FR",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      dtstart, dtend,
      `SUMMARY:${ev.title}`,
      ev.rrule&&!ev.isRecurring?`RRULE:${ev.rrule}`:"",
      ev.location?`LOCATION:${ev.location}`:"",
      ev.notes?`DESCRIPTION:${ev.notes.replace(/\n/g,"\\n")}`:"",
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}Z`,
      "END:VEVENT","END:VCALENDAR"
    ].filter(Boolean).join("\r\n");

    await caldavRequest("PUT", `${ev.calHref}${uid}.ics`, auth.auth, ics,
      {"Content-Type":"text/calendar; charset=utf-8"});
  }

  async function deleteEventFromICloud(ev){
    if(!auth||!ev.href) return;
    await caldavRequest("DELETE", ev.href, auth.auth);
  }

  // ── Actions ──
  function handleLogin(credentials){
    setAuth(credentials);
    save("cf_auth",credentials);
  }

  function handleLogout(){
    setAuth(null); save("cf_auth",null);
    setCalendars([]); setEvents([]);
  }

  async function createEvent(data){
    const ev = { ...data, id:`calflow-${Date.now()}`, type:"event" };
    setEvents(prev=>[...prev,ev]);
    await pushEvent(ev);
    await syncCalDAV();
    setFormOpen(false); setEditEv(null);
  }

  async function updateEvent(data){
    const ev = { ...editEv, ...data };
    setEvents(prev=>prev.map(e=>e.id===editEv.id?ev:e));
    await pushEvent(ev);
    setDetailEv(null); setEditEv(null);
  }

  async function deleteEvent(ev){
    setEvents(prev=>prev.filter(e=>e.id!==ev.id));
    await deleteEventFromICloud(ev);
    setDetailEv(null); setConfirmDel(null);
  }

  function createTask(data){
    const t={ id:Date.now(), ...data, createdAt:new Date().toISOString(),
      done:false, completedAt:null, type:"task" };
    setTasks(prev=>[t,...prev]);
    setTaskFormOpen(false); setEditTask(null);
  }

  function updateTask(data){
    setTasks(prev=>prev.map(t=>t.id===editTask.id?{...t,...data}:t));
    setDetailEv(null); setEditTask(null);
  }

  function doneTask(task){
    if(task.done){
      setTasks(prev=>prev.map(t=>t.id===task.id
        ?{...t,done:false,completedAt:null,effectiveDate:todayISO()}:t));
    } else {
      setTasks(prev=>prev.map(t=>t.id===task.id
        ?{...t,done:true,completedAt:new Date().toISOString()}:t));
    }
    setDetailEv(null);
  }

  function deleteTask(task){
    setTasks(prev=>prev.filter(t=>t.id!==task.id));
    setDetailEv(null); setConfirmDel(null);
  }

  function shareEvent(ev){
    const text = [
      ev.title,
      ev.allDay
        ? `📅 ${ev.startDate}${ev.endDate!==ev.startDate?" → "+ev.endDate:""} (Jour entier)`
        : `📅 ${ev.startDate} · ${ev.startTime} → ${ev.endTime}`,
      ev.location?`📍 ${ev.location}`:"",
      ev.notes?`\n${ev.notes}`:"",
    ].filter(Boolean).join("\n");

    if(navigator.share){
      navigator.share({ title:ev.title, text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Copié dans le presse-papier !");
    }
    setDetailEv(null);
  }

  // ── Swipe navigation ──
  function onTouchStart(e){ touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e){
    if(touchStartX.current===null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if(Math.abs(dx)>60){
      const d = new Date(weekStart);
      d.setDate(d.getDate()+(dx<0?7:-7));
      setWeekStart(getWeekStart(d));
    }
    touchStartX.current=null;
  }

  // ── Tous les événements du jour ──
  function getEventsForDay(iso){
    // CalDAV events
    const caldavEvs = events.filter(ev=>{
      if(ev.allDay) return iso>=ev.startDate && iso<=ev.endDate;
      return ev.startDate===iso;
    });
    // Tâches glissantes
    const dayTasks = tasks.filter(t=>{
      if(!settings.showDone&&t.done) return false;
      if(t.done) return t.completedAt?.slice(0,10)===iso;
      return (t.effectiveDate||t.createdAt?.slice(0,10))===iso;
    }).map(t=>({...t,type:"task",
      startDate:iso,
      startTime: t.done
        ? new Date(t.completedAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})
        : "08:00",
      endTime: t.done
        ? minutesToHHMM(timeToMinutes(new Date(t.completedAt).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}))+30)
        : "08:30",
    }));
    // Deadlines synthèse
    const deadlines = SYNTHESE_DEADLINES.filter(d=>{
      const year = new Date(d.date).getFullYear();
      return d.date===iso && year===new Date().getFullYear();
    }).map(d=>({...d,type:"synthese",allDay:true,startDate:d.date,endDate:d.date,
      calColor:C.green,calName:"Synthèses NotesFlow"}));

    // Les deadlines et allDay restent dans les bannières uniquement
    // Les tâches non-terminées vont dans le tiroir — seules les terminées restent dans la grille
    const timedCaldavEvs = caldavEvs.filter(ev=>!ev.allDay);
    const doneTasks = dayTasks.filter(t=>t.done);
    return [...timedCaldavEvs,...doneTasks];
  }

  // ── Événements all-day (bannières) ──
  function getBannerEvents(){
    const banners = [];
    // CalDAV all-day
    events.filter(ev=>ev.allDay).forEach(ev=>{
      const inWeek = weekDays.some(d=>d>=ev.startDate&&d<=ev.endDate);
      if(inWeek) banners.push(ev);
    });
    // Deadlines synthèse
    SYNTHESE_DEADLINES.forEach(d=>{
      const year = new Date(d.date).getFullYear();
      if(weekDays.includes(d.date)&&year===new Date().getFullYear()){
        banners.push({...d,type:"synthese",allDay:true,startDate:d.date,endDate:d.date,
          calColor:C.green,calName:"Synthèses NotesFlow"});
      }
    });
    return banners;
  }

  // ── Algorithme chevauchements ──
  function layoutEvents(dayEvs) {
    if(!dayEvs.length) return [];
    // Trier par heure de début
    const sorted = [...dayEvs].sort((a,b)=>
      timeToMinutes(a.startTime||"00:00")-timeToMinutes(b.startTime||"00:00"));
    
    const columns = [];
    const result = [];

    sorted.forEach(ev => {
      const evStart = timeToMinutes(ev.startTime||"00:00");
      const evEnd   = timeToMinutes(ev.endTime||"01:00");
      
      // Chercher une colonne libre
      let placed = false;
      for(let col=0; col<columns.length; col++){
        const lastEnd = timeToMinutes(columns[col].endTime||"01:00");
        if(evStart >= lastEnd){
          columns[col] = ev;
          result.push({...ev, col, totalCols:1});
          placed = true;
          break;
        }
      }
      if(!placed){
        columns.push(ev);
        result.push({...ev, col:columns.length-1, totalCols:1});
      }
    });

    // Calculer totalCols pour chaque événement
    const maxCols = columns.length;
    result.forEach(ev => {
      const evStart = timeToMinutes(ev.startTime||"00:00");
      const evEnd   = timeToMinutes(ev.endTime||"01:00");
      // Compter combien d'événements se chevauchent avec celui-ci
      const overlapping = result.filter(other => {
        if(other === ev) return false;
        const oStart = timeToMinutes(other.startTime||"00:00");
        const oEnd   = timeToMinutes(other.endTime||"01:00");
        return evStart < oEnd && evEnd > oStart;
      });
      ev.totalCols = overlapping.length + 1;
    });

    return result;
  }

  // ── Render ──
  if(!auth) return <LoginScreen onLogin={handleLogin}/>;

  if(screen==="settings") return(
    <SettingsScreen calendars={calendars} settings={settings}
      onSave={s=>setSettings(s)} onLogout={()=>{handleLogout();setScreen("calendar");}}
      onClose={()=>setScreen("calendar")}/>
  );

  const today = todayISO();
  const banners = getBannerEvents();
  const nowMinutes = new Date().getHours()*60+new Date().getMinutes();
  const nowY = (nowMinutes/GRID_TOTAL)*GRID_H;

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bg,
      overflow:"hidden",userSelect:"none"}}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* ── Header ── */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        padding:"12px 16px 10px",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:22,fontWeight:800,color:C.accent,
            fontFamily:"Phenomena,sans-serif",letterSpacing:-1,fontSize:28}}>NomadCal</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {/* Indicateur sync */}
            <div style={{width:11,height:11,borderRadius:"50%",
              background:syncing?"#F5C97A":syncOk?C.green:C.red,
              transition:"background .3s"}}
              title={syncing?"Synchronisation…":syncOk?"Synchronisé":"Erreur sync"}/>
            <button onClick={syncCalDAV} style={{background:"none",border:"none",
              color:C.muted,cursor:"pointer",fontSize:22,padding:4}}>↻</button>
            <button onClick={()=>setScreen("settings")} style={{background:"none",border:"none",
              color:C.muted,cursor:"pointer",fontSize:22,padding:4}}>⚙️</button>
          </div>
        </div>
        {clipboard ? (
          <div style={{display:"flex",alignItems:"center",gap:8,
            background:C.goldLight,border:`1px solid ${C.gold}`,
            borderRadius:10,padding:"8px 12px"}}>
            <span style={{fontSize:12,color:C.goldDark,flex:1,fontWeight:700}}>
              📋 {clipboard.title} — Tap sur un créneau pour coller
            </span>
            <button onClick={()=>{setClipboard(null);setPasteTarget(null);}}
              style={{background:"none",border:"none",color:C.goldDark,
                cursor:"pointer",fontSize:16,padding:"0 4px",fontWeight:700}}>✕</button>
          </div>
        ) : (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:13,color:C.muted,fontWeight:600}}>{fmtWeekRange(weekDays)}</span>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{setWeekStart(getWeekStart(new Date()));}}
                style={{fontSize:11,fontWeight:700,color:C.accent,background:C.accentLight,
                  border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",
                  cursor:"pointer",fontFamily:"inherit"}}>Aujourd'hui</button>
              <button onClick={()=>window.open("https://notes-flow-six.vercel.app","_blank")}
                style={{fontSize:11,fontWeight:700,color:C.accent,background:C.accentLight,
                  border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"4px 10px",
                  cursor:"pointer",fontFamily:"inherit"}}>
                📝 NomadNotes
              </button>
              <button onClick={()=>setFormOpen(true)}
                style={{fontSize:11,fontWeight:700,color:"#fff",background:C.accent,
                  border:"none",borderRadius:8,padding:"4px 10px",
                  cursor:"pointer",fontFamily:"inherit"}}>+ RDV</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Jours header ── */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        display:"flex",flexShrink:0}}>
        <div style={{width:36,flexShrink:0}}/>
        {weekDays.map(day=>{
          const isToday=day===today;
          const hasEv=getEventsForDay(day).length>0;
          return(
            <div key={day} style={{flex:1,textAlign:"center",padding:"6px 2px"}}>
              <div style={{fontSize:10,color:isToday?C.accent:C.muted,fontWeight:700,
                textTransform:"uppercase",letterSpacing:.3,marginBottom:2}}>
                {fmtDay(day)}
              </div>
              <div style={{width:26,height:26,borderRadius:"50%",margin:"0 auto",
                background:isToday?C.accent:"transparent",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:13,fontWeight:800,color:isToday?"#fff":C.ink}}>
                  {fmtDayNum(day)}
                </span>
              </div>
              {hasEv&&<div style={{width:4,height:4,borderRadius:"50%",background:isToday?C.accent:C.muted,margin:"2px auto 0"}}/>}
            </div>
          );
        })}
      </div>

      {/* ── Zone bannières (all-day) ── */}
      {banners.length>0&&(
        <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
          flexShrink:0,padding:"4px 0",
          minHeight: Math.max(28, banners.length * 24 + 8)}}>
          <div style={{display:"flex"}}>
            <div style={{width:36,flexShrink:0,fontSize:9,color:C.muted,
              textAlign:"right",paddingRight:4,paddingTop:4,lineHeight:1.2}}>
              Jour<br/>entier
            </div>
            <div style={{flex:1,position:"relative",minHeight:24}}>
              {banners.map((ev,i)=>{
                const startIdx = Math.max(0,weekDays.indexOf(ev.startDate));
                const endIdx   = Math.min(6,weekDays.indexOf(ev.endDate)<0?6:weekDays.indexOf(ev.endDate));
                const colW = 100/7;
                const left = startIdx*colW+"%";
                const width= (endIdx-startIdx+1)*colW+"%";
                const bg = ev.type==="synthese"?C.green:(ev.calColor||C.accent);
                return(
                  <div key={ev.id||i}
                    onClick={()=>setDetailEv(ev)}
                    style={{position:"absolute",top:i*22+2,left,width,
                      height:20,borderRadius:4,background:bg+"22",
                      border:`1.5px solid ${bg}`,
                      fontSize:10,fontWeight:700,color:bg,
                      padding:"0 5px",display:"flex",alignItems:"center",
                      cursor:"pointer",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",
                      boxSizing:"border-box"}}>
                    {ev.endDate!==ev.startDate&&<span style={{marginRight:4}}>→</span>}
                    {ev.title||ev.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Grille horaire ── */}
      <div ref={gridScrollRef} style={{flex:1,overflowY:"auto",position:"relative"}}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div style={{display:"flex",minHeight:GRID_H+20,position:"relative"}}>

          {/* Labels heures */}
          <div style={{width:36,flexShrink:0,position:"relative"}}>
            {Array.from({length:GRID_TOTAL/60},(_, i)=>{
              const h = GRID_START/60+i;
              const y = i*SLOT_H;
              return(
                <div key={h} style={{position:"absolute",top:y-7,right:4,
                  fontSize:9,color:C.muted,fontFamily:"monospace",lineHeight:1}}>
                  {h}h
                </div>
              );
            })}
          </div>

          {/* Colonnes jours */}
          <div style={{flex:1,display:"flex",position:"relative"}}>

            {/* Lignes horaires */}
            <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
              {Array.from({length:GRID_TOTAL/30},(_, i)=>(
                <div key={i} style={{position:"absolute",left:0,right:0,
                  top:i*(SLOT_H/2),
                  borderTop:`${i%2===0?"1px solid":"0.5px dashed"} ${C.border}`,
                  opacity:i%2===0?1:.5}}/>
              ))}
            </div>

            {/* Ligne heure courante */}
            {nowMinutes>=0&&nowMinutes<=1440&&(
              <div style={{position:"absolute",left:0,right:0,top:nowY,
                borderTop:`2px solid ${C.red}`,zIndex:10,pointerEvents:"none"}}>
                <div style={{width:11,height:11,borderRadius:"50%",background:C.red,
                  position:"absolute",left:-4,top:-4}}/>
              </div>
            )}

            {/* Colonnes */}
            {weekDays.map(day=>{
              const isToday=day===today;
              const isPast=day<today;
              const dayEvs=getEventsForDay(day).filter(ev=>!ev.allDay&&ev.startTime);

              return(
                <div key={day} style={{flex:1,position:"relative",
                  background:isToday?"#f0f6ff":"transparent",
                  borderLeft:`0.5px solid ${C.border}`,
                  opacity:isPast?.7:1}}
                  onClick={e=>{
                    const rect=e.currentTarget.getBoundingClientRect();
                    const relY=e.clientY-rect.top;
                    const min=Math.round((relY/GRID_H)*GRID_TOTAL/30)*30+GRID_START;
                    const time=minutesToHHMM(Math.max(0,Math.min(GRID_END-30,min)));
                    if(clipboard){
                      // Mode coller — ouvre confirmation avec heure présélectionnée
                      setPasteTarget({date:day,time});
                    } else {
                      setEditEv(null);
                      setFormOpen(true);
                    }
                  }}>

                  {/* Événements du jour avec gestion chevauchements */}
                  {layoutEvents(dayEvs).map(ev=>{
                    const y    = timeToY(ev.startTime||"09:00");
                    const h    = Math.max(20,durationToH(ev.startTime||"09:00",ev.endTime||"10:00"));
                    const isTask = ev.type==="task";
                    const evColor = isTask ? C.gold : (ev.calColor||C.accent);
                    const bg    = isTask ? C.goldLight : evColor;
                    const border= evColor;
                    function isLight(hex){
                      const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
                      return (r*299+g*587+b*114)/1000>128;
                    }
                    const textC = isTask ? C.goldDark : (isLight(evColor)?"#0F1D2B":"#ffffff");
                    const isDone= isTask&&ev.done;
                    // Position horizontale selon colonne
                    const colW = 100 / (ev.totalCols||1);
                    const leftPct = (ev.col||0) * colW;

                    return(
                      <div key={ev.id+ev.col}
                        onClick={e=>{e.stopPropagation();setDetailEv(ev);}}
                        onDoubleClick={e=>{e.stopPropagation();setClipboard(ev);
                          const t=document.createElement("div");
                          t.textContent="📋 Copié !";
                          t.style.cssText="position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#0F1D2B;color:#fff;padding:8px 16px;border-radius:20px;font-size:13px;z-index:999;font-family:inherit";
                          document.body.appendChild(t);
                          setTimeout(()=>t.remove(),2000);
                        }}
                        style={{position:"absolute",
                          top:y+1,
                          left:`${leftPct+0.5}%`,
                          width:`${colW-1}%`,
                          height:h-2,
                          background:bg,border:`1.5px solid ${ev.status==="pending"?"#F5A623":border}`,
                          borderRadius:6,
                          padding:"3px 4px",cursor:"pointer",overflow:"hidden",
                          opacity:isDone?.6:1,transition:"opacity .2s",
                          borderLeft:`3px solid ${ev.status==="pending"?"#F5A623":border}`,
                          boxSizing:"border-box"}}>
                        {ev.status==="pending"&&(
                          <div style={{position:"absolute",top:2,right:2,
                            width:6,height:6,borderRadius:"50%",background:"#F5A623"}}/>
                        )}
                        <div style={{fontSize:10,fontWeight:800,color:textC,lineHeight:1.3,
                          textDecoration:isDone?"line-through":"none"}}>
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
      </div>

      {/* ── Tiroir Tâches ── */}
      <div style={{
        position:"fixed",bottom:0,left:0,right:0,zIndex:200,
        transform:drawerOpen?"translateY(0)":"translateY(calc(100% - 170px))",
        transition:"transform .3s cubic-bezier(.4,0,.2,1)",
        maxHeight:"60vh",display:"flex",flexDirection:"column",
        background:C.surface,borderTop:`2px solid ${C.gold}`,
        borderRadius:"16px 16px 0 0",
        boxShadow:"0 -4px 20px rgba(0,0,0,.12)",
        paddingBottom:"env(safe-area-inset-bottom, 20px)"}}>

        {/* Handle + titre */}
        <div onClick={()=>setDrawerOpen(o=>!o)}
          style={{padding:"8px 16px 6px",cursor:"pointer",flexShrink:0}}>
          {/* Flèche gold pleine largeur */}
          <div style={{textAlign:"center",fontSize:20,color:C.gold,lineHeight:1,marginBottom:4}}>
            {drawerOpen ? "↓" : "↑"}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16,fontWeight:800,color:C.goldDark,
                fontFamily:"Phenomena,sans-serif"}}>
                ↻ Tâches en cours
              </span>
              <span style={{fontSize:13,background:C.goldLight,color:C.goldDark,
                border:`1px solid ${C.gold}88`,borderRadius:10,padding:"2px 8px",fontWeight:700}}>
                {tasks.filter(t=>!t.done).length}
              </span>
            </div>
            <button onClick={e=>{e.stopPropagation();setTaskFormOpen(true);}}
              style={{fontSize:11,fontWeight:700,color:"#fff",background:C.accent,
                border:"none",borderRadius:8,padding:"4px 10px",cursor:"pointer",fontFamily:"inherit"}}>
              + Tâche
            </button>
          </div>
        </div>

        {/* Liste tâches */}
        {drawerOpen&&(
          <div style={{overflowY:"auto",flex:1,padding:"4px 0 20px"}}>
            {tasks.filter(t=>!t.done).length===0&&(
              <div style={{textAlign:"center",padding:"20px",color:C.muted,fontSize:13}}>
                Aucune tâche en cours 🎉
              </div>
            )}
            {tasks.filter(t=>!t.done).map(task=>{
              const pr = PRIORITY[task.priority||"normal"];
              const isSwiped = swipeTaskId===task.id;
              return(
                <div key={task.id} style={{position:"relative",overflow:"hidden"}}>
                  {/* Fond rouge supprimer */}
                  <div style={{position:"absolute",right:0,top:0,bottom:0,width:80,
                    background:C.red,display:"flex",alignItems:"center",justifyContent:"center",
                    opacity:isSwiped?1:0,transition:"opacity .2s"}}>
                    <button onClick={()=>{setConfirmDel(task);setSwipeTaskId(null);}}
                      style={{background:"none",border:"none",color:"#fff",
                        fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                      🗑 Suppr.
                    </button>
                  </div>
                  {/* Item — tap ouvre la fiche */}
                  <div style={{
                    background:C.surface,
                    transform:isSwiped?"translateX(-80px)":"translateX(0)",
                    transition:"transform .2s",
                    padding:"12px 16px",
                    borderBottom:`0.5px solid ${C.border}`,
                    display:"flex",gap:10,alignItems:"center",cursor:"pointer"}}
                    onTouchStart={e=>{e.currentTarget._ts=e.touches[0].clientX;}}
                    onTouchEnd={e=>{
                      const dx=e.changedTouches[0].clientX-(e.currentTarget._ts||0);
                      if(dx<-40) setSwipeTaskId(task.id);
                      else if(dx>20) setSwipeTaskId(null);
                    }}
                    onClick={()=>{
                      if(swipeTaskId===task.id){setSwipeTaskId(null);return;}
                      setDetailEv({...task,type:"task"});
                      setDrawerOpen(false);
                    }}>
                    {/* Indicateur priorité */}
                    <div style={{width:10,height:10,borderRadius:"50%",
                      background:pr.color,flexShrink:0,boxShadow:`0 0 6px ${pr.color}88`}}/>
                    {/* Contenu */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:600,color:C.ink,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3}}>
                        {task.title}
                      </div>
                      <div style={{display:"flex",gap:6,alignItems:"center"}}>
                        <span style={{fontSize:11,color:pr.color,fontWeight:600}}>{pr.label}</span>
                        {task.dueDate&&<span style={{fontSize:11,color:C.muted}}>· {task.dueDate}</span>}
                        {task.recurrence&&task.recurrence!=="none"&&
                          <span style={{fontSize:11,color:C.accent}}>· 🔁</span>}
                      </div>
                    </div>
                    <span style={{color:C.muted,fontSize:20,flexShrink:0}}>›</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal confirmation coller ── */}
      <Modal open={!!clipboard&&!!pasteTarget} onClose={()=>setPasteTarget(null)}
        title="📋 Coller l'événement">
        {clipboard&&pasteTarget&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:C.bg,borderRadius:10,padding:"12px 14px",
              border:`1px solid ${C.border}`}}>
              <div style={{fontWeight:700,fontSize:15,color:C.ink,marginBottom:4}}>{clipboard.title}</div>
              <div style={{fontSize:13,color:C.muted}}>
                📅 {pasteTarget.date} · {pasteTarget.time}
              </div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <Btn onClick={()=>setPasteTarget(null)}>Annuler</Btn>
              <Btn variant="primary" onClick={async()=>{
                const duration = timeToMinutes(clipboard.endTime||"10:00") - timeToMinutes(clipboard.startTime||"09:00");
                const newEv={
                  ...clipboard,
                  id:`calflow-${Date.now()}`,
                  masterUid: undefined,
                  isRecurring: false,
                  startDate:pasteTarget.date,
                  endDate:pasteTarget.date,
                  startTime:pasteTarget.time,
                  endTime:minutesToHHMM(timeToMinutes(pasteTarget.time)+Math.max(30,duration)),
                };
                setEvents(prev=>[...prev,newEv]);
                await pushEvent(newEv);
                setClipboard(null); setPasteTarget(null);
              }}>Coller ici</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Modals ── */}
      {/* Créer RDV */}
      <Modal open={formOpen&&!editEv} onClose={()=>setFormOpen(false)} title="+ Nouvel événement">
        <EventForm calendars={calendars} defaultCalHref={settings.defaultCal}
          onSave={createEvent} onCancel={()=>setFormOpen(false)}/>
      </Modal>

      {/* Modifier RDV */}
      <Modal open={!!editEv} onClose={()=>setEditEv(null)} title="✎ Modifier l'événement">
        {editEv&&<EventForm initial={editEv} calendars={calendars} defaultCalHref={settings.defaultCal}
          onSave={updateEvent} onCancel={()=>setEditEv(null)}/>}
      </Modal>

      {/* Créer tâche */}
      <Modal open={taskFormOpen&&!editTask} onClose={()=>setTaskFormOpen(false)} title="↻ Nouvelle tâche glissante">
        <TaskForm onSave={createTask} onCancel={()=>setTaskFormOpen(false)}/>
      </Modal>

      {/* Modifier tâche */}
      <Modal open={!!editTask} onClose={()=>setEditTask(null)} title="✎ Modifier la tâche">
        {editTask&&<TaskForm initial={editTask} onSave={updateTask} onCancel={()=>setEditTask(null)}/>}
      </Modal>

      {/* Détail événement */}
      <Modal open={!!detailEv&&!confirmDel} onClose={()=>setDetailEv(null)}
        title={detailEv?.type==="task"?"Tâche glissante":detailEv?.type==="synthese"?"Deadline synthèse":"Événement"}>
        {detailEv&&<EventDetail ev={detailEv}
          onEdit={()=>{
            if(detailEv.type==="task"){setEditTask(detailEv);setDetailEv(null);}
            else{setEditEv(detailEv);setDetailEv(null);}
          }}
          onDelete={()=>setConfirmDel(detailEv)}
          onClose={()=>setDetailEv(null)}
          onShare={()=>shareEvent(detailEv)}
          onCopy={()=>{setClipboard(detailEv);setDetailEv(null);}}
        />}
        {detailEv?.type==="task"&&!detailEv.done&&(
          <div style={{marginTop:16}}>
            <Btn onClick={()=>{setConfirmDone(detailEv);setDetailEv(null);}} variant="outline"
              style={{width:"100%",color:C.green,borderColor:C.green}}>
              ✓ Marquer comme terminée
            </Btn>
          </div>
        )}
        {detailEv?.type==="task"&&detailEv.done&&(
          <div style={{marginTop:16}}>
            <Btn onClick={()=>doneTask(detailEv)} variant="ghost"
              style={{width:"100%"}}>
              ↩ Remettre en cours
            </Btn>
          </div>
        )}
      </Modal>

      {/* ── Confirmation terminer ── */}
      <Modal open={!!confirmDone} onClose={()=>setConfirmDone(null)} title="✓ Confirmer la validation">
        <div style={{fontSize:14,color:C.muted,lineHeight:1.6,marginBottom:8}}>
          Marquer cette tâche comme terminée ?
        </div>
        <div style={{background:C.bg,borderRadius:10,padding:"12px 14px",
          border:`1px solid ${C.border}`,marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:14,color:C.ink,marginBottom:4}}>
            {confirmDone?.title}
          </div>
          <div style={{fontSize:12,color:C.muted}}>
            Elle sera inscrite dans la grille à {new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}
          </div>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setConfirmDone(null)}>Annuler</Btn>
          <Btn variant="primary" style={{background:C.green,boxShadow:`0 2px 8px ${C.green}44`}}
            onClick={()=>{doneTask(confirmDone);setConfirmDone(null);}}>
            ✓ Oui, terminée !
          </Btn>
        </div>
      </Modal>

      {/* Confirmation suppression */}
      <Modal open={!!confirmDel} onClose={()=>setConfirmDel(null)} title="🗑 Confirmer la suppression">
        <p style={{fontSize:14,color:C.muted,lineHeight:1.6,marginBottom:20}}>
          Supprimer <strong>"{confirmDel?.title}"</strong> définitivement ?<br/>
          <span style={{fontSize:12,color:C.subtle}}>Cette action est irréversible.</span>
        </p>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={()=>setConfirmDel(null)}>Annuler</Btn>
          <Btn variant="danger" onClick={()=>{
            if(confirmDel.type==="task") deleteTask(confirmDel);
            else deleteEvent(confirmDel);
          }}>Supprimer</Btn>
        </div>
      </Modal>

      <style>{`
        * { box-sizing: border-box; }
        @font-face { font-family:'Phenomena'; src:url('/Phenomena-Bold.ttf') format('truetype'); font-weight:700; }
        @font-face { font-family:'Phenomena'; src:url('/Phenomena-Regular.ttf') format('truetype'); font-weight:400; }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
        input:focus,textarea:focus,select:focus{border-color:${C.accent} !important;outline:none;}
        button:active{transform:scale(.97);}
        input[type=date],input[type=time]{color-scheme:light;}
      `}</style>
    </div>
  );
}
