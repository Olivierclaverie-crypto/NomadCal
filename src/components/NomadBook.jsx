import { useState, useEffect, useRef } from "react";
import {
  getPeriodEvents, createPeriodEvent, updatePeriodEvent,
  deletePeriodEvent, autoLabel, calendarDisplayName, checkCalendarExists
} from "../utils/caldavCalendar.js";
import { compressImage, savePhoto, getPhotoURL, deletePhoto, requestPersistentStorage } from "../utils/photoStore.js";

const C = {
  bg:"#fdf8f0", surface:"#ffffff", card:"#fffcf7",
  border:"#e8d9c0", borderDark:"#c9b48a",
  accent:"#2B5A9E", accentLight:"#eaf1fb", accentBorder:"#BAD6F0",
  ink:"#0F1D2B", muted:"#5a6e7f", subtle:"#8B5E20",
  green:"#2d7a4f", greenLight:"#edf7f1",
  red:"#c0392b", redLight:"#fdf0ef",
  amber:"#8B5E20", amberLight:"#fdf3e3",
  gold:"#F5C97A", goldLight:"#fdf8ed",
  purple:"#6B3FA0", purpleLight:"#f3edfb",
};

// ── Icônes SVG ────────────────────────────────────────────────────────────────
const ICONS = {
  concurrence:  <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 3v14" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/><path d="M4 4l6 2-6 2z" fill="#2B5A9E"/><path d="M16 3v14" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 4l-6 2 6 2z" fill="#F5C97A"/></svg>,
  marche:       <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="10" width="3" height="8" rx="1" fill="#2B5A9E"/><rect x="7" y="6" width="3" height="12" rx="1" fill="#2B5A9E"/><rect x="12" y="2" width="3" height="16" rx="1" fill="#2B5A9E"/><path d="M2 16 Q8 8 17 4" stroke="#F5C97A" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>,
  nouveautes:   <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#2B5A9E" strokeWidth="1.5"/><path d="M10 6v4l3 2" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/><circle cx="15" cy="5" r="3" fill="#F5C97A"/><path d="M14 5h2M15 4v2" stroke="#0F1D2B" strokeWidth="1" strokeLinecap="round"/></svg>,
  logistique:   <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="1" y="9" width="11" height="7" rx="1.5" stroke="#2B5A9E" strokeWidth="1.5"/><path d="M12 11h3l3 2v3h-3" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="5" cy="17" r="1.5" fill="#2B5A9E"/><circle cx="14" cy="17" r="1.5" fill="#2B5A9E"/><path d="M4 9V6a3 3 0 016 0v3" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  propositions: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="8" r="4" stroke="#2B5A9E" strokeWidth="1.5"/><path d="M10 4V2M10 12v2M6 8H4M16 8h-2" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/><path d="M7 14h6v1.5a1 1 0 01-1 1H8a1 1 0 01-1-1V14z" fill="#2B5A9E"/></svg>,
  performances: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l2 5h5l-4 3 1.5 5L10 12l-4.5 3L7 10 3 7h5z" stroke="#2B5A9E" strokeWidth="1.5" strokeLinejoin="round" fill="#eaf1fb"/><circle cx="10" cy="10" r="2" fill="#F5C97A"/></svg>,
  alertes:      <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 2l8 14H2z" stroke="#c0392b" strokeWidth="1.5" strokeLinejoin="round" fill="#fdf0ef"/><path d="M10 8v4" stroke="#c0392b" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="14" r="1" fill="#c0392b"/></svg>,
  reassorts:    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M4 10a6 6 0 016-6" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 10a6 6 0 01-6 6" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/><path d="M1 10l3-3 3 3" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M19 10l-3 3-3-3" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>,
  operations:   <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="#2B5A9E" strokeWidth="1.5"/><circle cx="10" cy="10" r="4" stroke="#2B5A9E" strokeWidth="1.5"/><circle cx="10" cy="10" r="1.5" fill="#F5C97A"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="#2B5A9E" strokeWidth="1" strokeLinecap="round" opacity=".4"/></svg>,
  saisonnalite: <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="13" rx="1.5" stroke="#2B5A9E" strokeWidth="1.5"/><path d="M3 8h14" stroke="#2B5A9E" strokeWidth="1.5"/><path d="M7 2v4M13 2v4" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/><rect x="6" y="11" width="3" height="3" rx=".5" fill="#2B5A9E" opacity=".5"/><rect x="11" y="11" width="3" height="3" rx=".5" fill="#2B5A9E" opacity=".5"/></svg>,
  dedicaces:    <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M15 3c-4 0-8 4-9 9l5-2 1-5" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M6 12c1 2 2 3 3 4" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/><path d="M4 17l2-4" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  outils:       <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="10" rx="1.5" stroke="#2B5A9E" strokeWidth="1.5"/><rect x="4" y="6" width="12" height="6" rx=".5" fill="#eaf1fb" stroke="#2B5A9E" strokeWidth=".5"/><path d="M7 17h6" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 14v3" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="9" r="1.5" fill="#F5C97A"/></svg>,
  client:       <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="4" stroke="#2B5A9E" strokeWidth="1.5"/><path d="M3 18c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

const IconCalendar = () => (
  <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke="#2B5A9E" strokeWidth="1.5"/>
    <path d="M2 8h16" stroke="#2B5A9E" strokeWidth="1.5"/>
    <path d="M6 2v4M14 2v4" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="5" y="11" width="3" height="3" rx=".5" fill="#2B5A9E" opacity=".6"/>
    <rect x="9" y="11" width="3" height="3" rx=".5" fill="#2B5A9E" opacity=".3"/>
  </svg>
);

const IconSettings = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="#5a6e7f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconMic = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="7" y="2" width="6" height="10" rx="3" stroke={active?"#c0392b":"#2B5A9E"} strokeWidth="1.5"/>
    <path d="M4 10a6 6 0 0012 0" stroke={active?"#c0392b":"#2B5A9E"} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 16v3" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconNotes = ({ active=false }) => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="4" y="3" width="12" height="14" rx="1.5" stroke={active?"#fff":"#2B5A9E"} strokeWidth="1.5"/>
    <path d="M7 7h6M7 10h6M7 13h4" stroke={active?"#fff":"#2B5A9E"} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 13l3 3" stroke={active?"rgba(255,255,255,0.6)":"#F5C97A"} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconRapport = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="3" width="14" height="14" rx="1.5" stroke="#2B5A9E" strokeWidth="1.5"/>
    <path d="M6 10h8M6 7h5M6 13h6" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="15" cy="5" r="3" fill="#F5C97A"/>
  </svg>
);

const CHAPTERS = [
  { id:"client",       label:"Client" },
  { id:"marche",       label:"Marché" },
  { id:"concurrence",  label:"Concurrence" },
  { id:"nouveautes",   label:"Nouveautés" },
  { id:"logistique",   label:"Logistique" },
  { id:"propositions", label:"Propositions" },
  { id:"performances", label:"Performances" },
  { id:"alertes",      label:"Alertes" },
  { id:"reassorts",    label:"Réassorts" },
  { id:"operations",   label:"Opérations en cours" },
  { id:"saisonnalite", label:"Saisonnalité" },
  { id:"dedicaces",    label:"Demandes de dédicace" },
  { id:"outils",       label:"Outils" },
];

const RRULE_OPTIONS = [
  { value:"",                                    label:"Aucune récurrence" },
  { value:"FREQ=WEEKLY;INTERVAL=1",              label:"Hebdomadaire" },
  { value:"FREQ=WEEKLY;INTERVAL=2",              label:"Toutes les 2 semaines" },
  { value:"FREQ=MONTHLY;INTERVAL=1",             label:"Mensuelle (même date)" },
  { value:"FREQ=MONTHLY;BYDAY=1MO",              label:"1er lundi du mois" },
  { value:"FREQ=MONTHLY;BYDAY=2MO",              label:"2ème lundi du mois" },
  { value:"FREQ=MONTHLY;BYDAY=3MO",              label:"3ème lundi du mois" },
  { value:"FREQ=MONTHLY;BYDAY=1FR",              label:"1er vendredi du mois" },
  { value:"FREQ=MONTHLY;BYDAY=-1FR",             label:"Dernier vendredi du mois" },
  { value:"FREQ=MONTHLY;BYDAY=-1MO",             label:"Dernier lundi du mois" },
];

const fmt      = d => new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"});
const fmtYear  = d => new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});
const daysLeft = d => Math.ceil((new Date(d)-new Date())/86400000);
const load     = (k,def) => { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } };
const save     = (k,v)   => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };

function getPeriodStatus(p){ const now=new Date(); if(now>=new Date(p.startISO)&&now<new Date(p.endISO)) return "current"; if(now<new Date(p.startISO)) return "future"; return "past"; }
function urgencyStyle(days){ if(days<0) return {color:C.red,bg:C.redLight,label:"Dépassé"}; if(days===0) return {color:C.red,bg:C.redLight,label:"Aujourd'hui"}; if(days<=3) return {color:C.amber,bg:C.amberLight,label:`J-${days}`}; if(days<=10) return {color:C.accent,bg:C.accentLight,label:`J-${days}`}; return {color:C.green,bg:C.greenLight,label:`J-${days}`}; }
function chapterById(id){ return CHAPTERS.find(c=>c.id===id)||CHAPTERS[0]; }
function daysUntilStart(iso){ return Math.ceil((new Date(iso)-new Date())/86400000); }

function ChapterIcon({ id, size=18 }) {
  const icon = ICONS[id];
  if (!icon) return null;
  return (
    <div style={{width:size+10,height:size+10,borderRadius:8,background:id==="alertes"?C.redLight:C.accentLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {icon}
    </div>
  );
}

function Pill({children,color=C.accent,bg=C.accentLight}){ return <span style={{fontSize:11,fontWeight:700,color,background:bg,padding:"2px 8px",borderRadius:20}}>{children}</span>; }
function Btn({onClick,children,variant="ghost",style={},disabled=false}){ const base={border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",borderRadius:8,fontSize:13,fontWeight:600,padding:"8px 16px",transition:"all .15s",opacity:disabled?.5:1}; const variants={ghost:{background:"transparent",color:C.muted},primary:{background:C.accent,color:"#fff",boxShadow:`0 2px 8px ${C.accent}44`},outline:{background:"transparent",color:C.accent,border:`1.5px solid ${C.accent}`},soft:{background:C.accentLight,color:C.accent,border:`1px solid ${C.accentBorder}`},danger:{background:C.redLight,color:C.red,border:`1px solid ${C.red}44`}}; return <button onClick={disabled?undefined:onClick} style={{...base,...variants[variant],...style}}>{children}</button>; }
function Modal({open,onClose,title,children,wide=false}){ if(!open) return null; return(<div style={{position:"fixed",inset:0,background:"rgba(26,23,20,.55)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}><div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:wide?640:460,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><span style={{fontWeight:700,fontSize:17,color:C.ink,letterSpacing:-.3}}>{title}</span><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.subtle,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8}}>✕</button></div>{children}</div></div>); }

const inputStyle = { background:C.bg, border:`1.5px solid ${C.border}`, color:C.ink, padding:"10px 14px", borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box", transition:"border-color .15s" };

function useVoice(onConfirm){ const rec=useRef(null); const [listening,setListening]=useState(false); const [transcript,setTranscript]=useState(""); const start=()=>{ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){alert("Dictée vocale non supportée.");return;} const r=new SR(); r.lang="fr-FR"; r.continuous=false; r.interimResults=true; r.onresult=e=>{const t=Array.from(e.results).map(x=>x[0].transcript).join("");setTranscript(t);}; r.onend=()=>setListening(false); r.start(); rec.current=r; setListening(true); setTranscript(""); }; const stop=()=>rec.current?.stop(); const confirm=()=>{if(transcript.trim()){onConfirm(transcript.trim());setTranscript("");}}; const discard=()=>setTranscript(""); return {listening,transcript,start,stop,confirm,discard}; }

function AIChat({period,notes,onReportSaved}){ const [messages,setMessages]=useState([]); const [input,setInput]=useState(""); const [loading,setLoading]=useState(false); const [report,setReport]=useState(""); const bottomRef=useRef(); const initialized=useRef(false); useEffect(()=>{ if(initialized.current) return; initialized.current=true; const byChapter={}; notes.forEach(n=>{if(!byChapter[n.chapter])byChapter[n.chapter]=[];byChapter[n.chapter].push(n.text);}); const intro=`Bonjour ! Je suis prêt pour le brainstorming du **${period.label}** (compilation le ${fmt(period.endISO)}).\n\nJ'ai ${notes.length} note(s) réparties en ${Object.keys(byChapter).length} chapitre(s). Quelques questions pour affiner le rapport avant de le générer :`; setMessages([{role:"assistant",content:intro}]); },[]); useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[messages]); async function send(){ if(!input.trim()||loading) return; const userMsg={role:"user",content:input.trim()}; const newMessages=[...messages,userMsg]; setMessages(newMessages); setInput(""); setLoading(true); const byChapter={}; notes.forEach(n=>{if(!byChapter[n.chapter])byChapter[n.chapter]=[];byChapter[n.chapter].push(n.text);}); const notesText=CHAPTERS.filter(c=>byChapter[c.id]).map(c=>`### ${c.label}\n${byChapter[c.id].map(t=>`- ${t}`).join("\n")}`).join("\n\n"); try{ const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:`Tu es un assistant de terrain pour un commercial éditorial expérimenté. Période : ${period.label} (du ${fmt(period.startISO)} au ${fmt(period.endISO)}). Notes terrain par chapitre :\n${notesText}\n\nAide à brainstormer et affiner le rapport. Quand l'utilisateur demande le rapport final, génère un rapport professionnel structuré par chapitres, avec pour chaque chapitre : synthèse des points clés, actions recommandées. Termine par une section "Points prioritaires" avec les 3-5 actions urgentes. Ton : professionnel, concis, orienté action. En français.`,messages:newMessages.map(m=>({role:m.role,content:m.content}))})}); const data=await res.json(); const reply=data.content?.map(b=>b.text||"").join("")||"Erreur."; setMessages(prev=>[...prev,{role:"assistant",content:reply}]); if(reply.length>600&&(reply.includes("##")||reply.includes("Points prioritaires"))){ setReport(reply); onReportSaved&&onReportSaved(reply); } }catch{ setMessages(prev=>[...prev,{role:"assistant",content:"Erreur de connexion."}]); } setLoading(false); } return(<div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{maxHeight:340,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,padding:"4px 0"}}>{messages.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:14,fontSize:14,lineHeight:1.65,background:m.role==="user"?C.accent:C.bg,color:m.role==="user"?"#fff":C.ink,borderBottomRightRadius:m.role==="user"?3:14,borderBottomLeftRadius:m.role==="assistant"?3:14,border:m.role==="assistant"?`1px solid ${C.border}`:"none",whiteSpace:"pre-wrap"}}>{m.content}</div></div>))}{loading&&(<div style={{display:"flex",alignItems:"center",gap:8,color:C.muted,fontSize:13,padding:"4px 0"}}><span style={{display:"flex",gap:4}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:C.subtle,animation:`bounce 1s ${i*.2}s infinite`}}/>)}</span>Claude rédige…</div>)}<div ref={bottomRef}/></div><div style={{display:"flex",gap:8}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder='Réponds ou dis "génère le rapport final"…' style={{...inputStyle,flex:1,fontSize:13}}/><Btn onClick={send} variant="primary" disabled={loading} style={{padding:"10px 14px"}}>→</Btn></div>{report&&(<div style={{background:C.greenLight,border:`1.5px solid ${C.green}44`,borderRadius:12,padding:14,marginTop:4}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{color:C.green,fontSize:13,fontWeight:700}}>✓ Rapport sauvegardé</span><div style={{display:"flex",gap:8}}><Btn onClick={()=>navigator.clipboard.writeText(report)} variant="outline" style={{fontSize:12,padding:"5px 12px"}}>Copier</Btn><Btn onClick={()=>{const sub=encodeURIComponent(`${period.label} — Rapport terrain`);window.location.href=`mailto:?subject=${sub}&body=${encodeURIComponent(report)}`;}} variant="outline" style={{fontSize:12,padding:"5px 12px"}}>Envoyer</Btn></div></div></div>)}</div>); }

// ── Carte période ─────────────────────────────────────────────────────────────
function PeriodCard({ p, status, noteCount, chapterCounts, totalNotes, synthese, index, total, onTap, onEdit, onDelete }) {
  const [swiped, setSwiped] = useState(false);
  const touchStartX = useRef(null);
  const days = daysLeft(p.endISO);
  const urg  = urgencyStyle(days);

  const cardStyle = {
    borderRadius:12, padding:"14px 16px",
    border: status==="current" ? `2px solid ${C.gold}` : status==="future" ? `1.5px solid ${C.accentBorder}` : `1px solid ${C.border}`,
    background: status==="current" ? C.goldLight : status==="future" ? C.accentLight : C.surface,
    transition:"transform .2s", transform: swiped?"translateX(-80px)":"translateX(0)",
    cursor:"pointer",
  };

  return(
    <div style={{position:"relative",overflow:"hidden",borderRadius:12,marginBottom:8}}>
      {/* Action swipe supprimer */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:80,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",opacity:swiped?1:0,transition:"opacity .2s"}}>
        <button onClick={()=>onDelete(p)} style={{background:"none",border:"none",color:"#fff",cursor:"pointer"}}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 7h10M8 7V5h4v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="6" y="7" width="8" height="10" rx="1" stroke="#fff" strokeWidth="1.5"/></svg>
        </button>
      </div>

      <div
        style={cardStyle}
        onTouchStart={e=>{touchStartX.current=e.touches[0].clientX;}}
        onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-(touchStartX.current||0); if(dx<-50)setSwiped(true); else if(dx>20)setSwiped(false); touchStartX.current=null;}}
        onClick={()=>{ if(swiped){setSwiped(false);return;} onTap(p); }}
      >
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
              <span style={{width:8,height:8,borderRadius:"50%",background:status==="current"?C.gold:status==="future"?C.accent:C.border,display:"inline-block",flexShrink:0}}/>
              <span style={{fontWeight:700,fontSize:14,color:status==="current"?C.amber:status==="future"?C.accent:C.muted}}>{p.label}</span>
            </div>
            <div style={{fontSize:12,color:C.muted}}>{fmtYear(p.startISO)} → {fmtYear(p.endISO)}</div>
            {p.rrule&&<div style={{fontSize:11,color:C.accent,marginTop:2}}>↻ {RRULE_OPTIONS.find(r=>r.value===p.rrule)?.label||"Récurrent"}</div>}
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
            {status==="current"&&<Pill color={C.amber} bg={C.amberLight}>{urg.label}</Pill>}
            {status==="future"&&<span style={{fontSize:11,color:C.accent,fontWeight:600}}>dans {daysUntilStart(p.startISO)}j</span>}
            {status==="past"&&(
              synthese
                ? <span style={{fontSize:10,fontWeight:700,color:C.green,background:C.greenLight,border:`1px solid ${C.green}44`,borderRadius:10,padding:"2px 7px"}}>✓ Synthèse</span>
                : <span style={{fontSize:10,fontWeight:700,color:C.muted,background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"2px 7px"}}>Sans synthèse</span>
            )}
            {/* Bouton modifier */}
            <button onClick={e=>{e.stopPropagation();setSwiped(false);onEdit(p);}} style={{background:"none",border:"none",cursor:"pointer",padding:4}}>
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M13 4l3 3-9 9H4v-3z" stroke="#5a6e7f" strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 6l3 3" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Mini barres chapitres — en cours uniquement */}
        {status==="current"&&totalNotes>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:8}}>
            {CHAPTERS.filter(c=>chapterCounts[c.id]).slice(0,4).map(c=>(
              <div key={c.id} style={{display:"flex",alignItems:"center",gap:6}}>
                <ChapterIcon id={c.id} size={10}/>
                <span style={{fontSize:10,color:C.muted,width:80,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.label}</span>
                <div style={{height:4,flex:1,background:C.border,borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",background:C.gold,borderRadius:2,width:`${(chapterCounts[c.id]/totalNotes)*100}%`}}/>
                </div>
                <span style={{fontSize:10,color:C.muted,minWidth:16,textAlign:"right"}}>{chapterCounts[c.id]}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:11,color:C.muted}}>
            {noteCount > 0 ? `${noteCount} note${noteCount>1?"s":""}` : "Aucune note"}
          </span>
          <span style={{fontSize:10,color:C.muted}}>{index+1}/{total}</span>
        </div>
      </div>
    </div>
  );
}

// ── Formulaire période ────────────────────────────────────────────────────────
function PeriodForm({ initial, lastEndISO, onSave, onCancel, loading }) {
  const today = new Date().toISOString().slice(0,10);
  const [startISO, setStart] = useState(initial?.startISO || lastEndISO || today);
  const [endISO,   setEnd]   = useState(initial?.endISO   || "");
  const [label,    setLabel] = useState(initial?.label    || "");
  const [rrule,    setRrule] = useState(initial?.rrule    || "");

  // Auto-génère le label quand les dates changent
  useEffect(()=>{
    if(startISO&&endISO&&!initial?.label){
      setLabel(autoLabel(startISO,endISO));
    }
  },[startISO,endISO]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8}}>
        <div style={{flex:1}}>
          <label style={{fontSize:11,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>
            {!initial?"Date de début *":"Date de début"}
          </label>
          <input type="date" value={startISO} onChange={e=>setStart(e.target.value)} style={inputStyle}/>
        </div>
        <div style={{flex:1}}>
          <label style={{fontSize:11,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>Date de fin *</label>
          <input type="date" value={endISO} onChange={e=>setEnd(e.target.value)} style={inputStyle} min={startISO}/>
        </div>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>Label (auto-généré)</label>
        <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Rapport Mai 2026…" style={inputStyle}/>
      </div>
      <div>
        <label style={{fontSize:11,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>Récurrence (optionnelle)</label>
        <select value={rrule} onChange={e=>setRrule(e.target.value)} style={{...inputStyle}}>
          {RRULE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
        <Btn onClick={onCancel}>Annuler</Btn>
        <Btn onClick={()=>onSave({startISO,endISO,label,rrule})} variant="primary" disabled={!startISO||!endISO||loading}>
          {loading?"Création…":"Enregistrer"}
        </Btn>
      </div>
    </div>
  );
}

// ── Vignette photo ────────────────────────────────────────────────────────────
// Si "url" est fourni (aperçu en cours de création) on l'affiche directement.
// Sinon on charge le blob depuis le vestiaire IndexedDB via son ticket "id".
function PhotoThumb({ id, url, size=60, onRemove }){
  const [src,setSrc] = useState(url||null);
  useEffect(()=>{
    if(url){ setSrc(url); return; }
    let alive=true, made=null;
    getPhotoURL(id).then(u=>{ if(alive){ made=u; setSrc(u); } });
    return ()=>{ alive=false; if(made) URL.revokeObjectURL(made); };
  },[id,url]);
  return(
    <div style={{position:"relative",flexShrink:0}}>
      {src
        ? <img src={src} alt="" style={{width:size,height:size,objectFit:"cover",borderRadius:8,border:`1px solid ${C.border}`,display:"block"}}/>
        : <div style={{width:size,height:size,borderRadius:8,background:C.bg,border:`1px solid ${C.border}`}}/>}
      {onRemove&&(
        <button onClick={onRemove} style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:"50%",background:C.red,color:"#fff",border:"2px solid #fff",cursor:"pointer",fontSize:11,lineHeight:1,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>✕</button>
      )}
    </div>
  );
}

// ── Carte note ────────────────────────────────────────────────────────────────
function NoteCard({note,onDelete,onEdit}){
  const [editing,setEditing]=useState(false);
  const [editText,setEditText]=useState(note.text);
  const [editChapter,setEditChapter]=useState(note.chapter);
  const [editKept,setEditKept]=useState(note.photos||[]);   // photos existantes conservees (ids)
  const [editNew,setEditNew]=useState([]);                   // photos ajoutees : {url, blob}
  const editGalleryRef=useRef(null);
  const editCameraRef=useRef(null);
  const [swiped,setSwiped]=useState(false);
  const touchStartX=useRef(null);
  const ch=chapterById(note.chapter);

  async function handleEditPhotoFiles(fileList){
    const files=Array.from(fileList||[]);
    for(const file of files){
      try{
        const blob=await compressImage(file);
        const url=URL.createObjectURL(blob);
        setEditNew(prev=>[...prev,{url,blob}]);
      }catch(e){ /* image illisible : ignoree */ }
    }
  }
  function removeKept(id){ setEditKept(prev=>prev.filter(x=>x!==id)); }
  function removeNew(index){
    setEditNew(prev=>{ const p=prev[index]; if(p) URL.revokeObjectURL(p.url); return prev.filter((_,i)=>i!==index); });
  }

  async function saveEdit(){
    if(!editText.trim()) return;
    // Range les nouvelles photos au vestiaire -> on recupere leurs tickets.
    const newIds=[];
    for(const p of editNew){
      try{ const pid=await savePhoto(p.blob); newIds.push(pid); }catch(e){ /* echec stockage : ignoree */ }
    }
    // Photos retirees = celles qui etaient la mais ne sont plus conservees -> effacees du vestiaire.
    const original=note.photos||[];
    const removed=original.filter(id=>!editKept.includes(id));
    for(const id of removed){ try{ await deletePhoto(id); }catch(e){ /* ignore */ } }
    const finalPhotos=[...editKept,...newIds];
    editNew.forEach(p=>URL.revokeObjectURL(p.url));
    setEditNew([]);
    onEdit(note.id,{text:editText.trim(),chapter:editChapter,photos:finalPhotos});
    setEditing(false);
  }
  function cancelEdit(){
    editNew.forEach(p=>URL.revokeObjectURL(p.url));  // rien n'a ete stocke -> aucune perte
    setEditNew([]);
    setEditKept(note.photos||[]);
    setEditText(note.text); setEditChapter(note.chapter); setEditing(false);
  }

  if(editing){
    return(
      <div style={{background:C.surface,borderRadius:12,padding:"16px",border:`2px solid ${C.accent}`,boxShadow:`0 0 0 3px ${C.accentLight}`}}>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:8}}>Chapitre</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {CHAPTERS.map(c=>(<button key={c.id} onClick={()=>setEditChapter(c.id)} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,fontWeight:600,padding:"5px 10px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",border:`1.5px solid ${editChapter===c.id?C.accent:C.border}`,background:editChapter===c.id?C.accent:C.bg,color:editChapter===c.id?"#fff":C.muted}}><ChapterIcon id={c.id} size={10}/>{c.label}</button>))}
          </div>
        </div>
        <textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={3} autoFocus style={{...inputStyle,resize:"vertical",marginBottom:12,lineHeight:1.6}}/>
        {/* ── Photos (modification) ── */}
        <input ref={editGalleryRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{handleEditPhotoFiles(e.target.files); e.target.value="";}}/>
        <input ref={editCameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{handleEditPhotoFiles(e.target.files); e.target.value="";}}/>
        {(editKept.length>0||editNew.length>0)&&(
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            {editKept.map(pid=><PhotoThumb key={pid} id={pid} size={56} onRemove={()=>removeKept(pid)}/>)}
            {editNew.map((p,i)=><PhotoThumb key={"new"+i} url={p.url} size={56} onRemove={()=>removeNew(i)}/>)}
          </div>
        )}
        <div style={{display:"flex",gap:8,marginBottom:12}}>
          <button onClick={()=>editGalleryRef.current?.click()} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12,fontWeight:600,padding:"7px 10px",borderRadius:10,border:`1.5px solid ${C.accentBorder}`,background:C.accentLight,color:C.accent,cursor:"pointer",fontFamily:"inherit"}}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="#2B5A9E" strokeWidth="1.5"/><circle cx="7" cy="8.5" r="1.5" fill="#F5C97A"/><path d="M3 14l4-4 3 3 3-3 4 4" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Ajouter
          </button>
          <button onClick={()=>editCameraRef.current?.click()} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:12,fontWeight:600,padding:"7px 10px",borderRadius:10,border:`1.5px solid ${C.accentBorder}`,background:C.accentLight,color:C.accent,cursor:"pointer",fontFamily:"inherit"}}>
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M3 6.5h2.5L7 4.5h6L14.5 6.5H17a1 1 0 011 1V15a1 1 0 01-1 1H3a1 1 0 01-1-1V7.5a1 1 0 011-1z" stroke="#2B5A9E" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="10" cy="11" r="3" stroke="#F5C97A" strokeWidth="1.5"/></svg>
            Photo
          </button>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={cancelEdit} variant="ghost" style={{fontSize:12,padding:"6px 12px"}}>Annuler</Btn>
          <Btn onClick={saveEdit} variant="primary" style={{fontSize:12,padding:"6px 14px"}} disabled={!editText.trim()}>Enregistrer</Btn>
        </div>
      </div>
    );
  }

  return(
    <div style={{position:"relative",overflow:"hidden",borderRadius:12}}>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:80,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",opacity:swiped?1:0,transition:"opacity .2s"}}>
        <button onClick={()=>onDelete(note.id)} style={{background:"none",border:"none",color:"#fff",cursor:"pointer"}}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M5 7h10M8 7V5h4v2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="6" y="7" width="8" height="10" rx="1" stroke="#fff" strokeWidth="1.5"/></svg>
        </button>
      </div>
      <div
        onTouchStart={e=>{touchStartX.current=e.touches[0].clientX;}}
        onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-(touchStartX.current||0); if(dx<-50)setSwiped(true); else if(dx>20)setSwiped(false); touchStartX.current=null;}}
        style={{background:C.surface,borderRadius:12,padding:"14px 16px",border:`1.5px solid ${C.border}`,display:"flex",gap:12,alignItems:"flex-start",transition:"transform .2s",transform:swiped?"translateX(-80px)":"translateX(0)"}}>
        <ChapterIcon id={ch.id} size={16}/>
        <div style={{flex:1,minWidth:0}}>
          <p style={{margin:"0 0 6px",fontSize:14,lineHeight:1.65,color:C.ink,fontFamily:"Phenomena, sans-serif"}}>{note.text}</p>
          {note.photos&&note.photos.length>0&&(
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
              {note.photos.map(pid=><PhotoThumb key={pid} id={pid} size={56}/>)}
            </div>
          )}
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:C.subtle,fontFamily:"monospace"}}>{new Date(note.createdAt).toLocaleDateString("fr-FR")}</span>
            <span style={{fontSize:11,color:C.subtle}}>·</span>
            <div style={{display:"flex",alignItems:"center",gap:3}}><ChapterIcon id={ch.id} size={8}/><span style={{fontSize:11,color:C.muted}}>{ch.label}</span></div>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
          <button onClick={e=>{e.stopPropagation();setEditing(true);setSwiped(false);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:4,borderRadius:6,lineHeight:1}}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M13 4l3 3-9 9H4v-3z" stroke="#5a6e7f" strokeWidth="1.5" strokeLinejoin="round"/><path d="M11 6l3 3" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
          <button onClick={e=>{e.stopPropagation();navigator.clipboard.writeText(note.text).then(()=>{const t=e.currentTarget;t.style.color="#2d7a4f";setTimeout(()=>t.style.color="",1000);if(navigator.vibrate)navigator.vibrate(10);});}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",padding:4,borderRadius:6,lineHeight:1}} title="Copié !">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><rect x="7" y="7" width="10" height="10" rx="1.5" stroke="#5a6e7f" strokeWidth="1.5"/><path d="M13 7V5a1.5 1.5 0 00-1.5-1.5h-7A1.5 1.5 0 003 5v7A1.5 1.5 0 004.5 13.5H7" stroke="#F5C97A" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function NomadBook({ onClose, auth }) {
  const [tab,setTab]               = useState("notes");
  const [notes,setNotes]           = useState(()=>load("nb_notes",[]));
  // Recharge les notes à chaque ouverture ET retour de veille
  useEffect(()=>{
    setNotes(load("nb_notes",[]));
    const onVisible = () => {
      if(document.visibilityState === "visible") {
        setNotes(load("nb_notes",[]));
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  },[]);
  const [periods,setPeriods]       = useState(()=>load("nb_periods_cache",[]));
  const [syntheses,setSyntheses]   = useState(()=>load("nb_syntheses",{}));
  const [loadingPeriods,setLoadingPeriods] = useState(true);
  const [calAvailable,setCalAvailable]     = useState(true);
  const [captureOpen,setCaptureOpen]   = useState(false);
  const [voiceOpen,setVoiceOpen]       = useState(false);
  const [chatOpen,setChatOpen]         = useState(false);
  const [periodFormOpen,setPeriodFormOpen] = useState(false);
  const [editingPeriod,setEditingPeriod]   = useState(null);
  const [savingPeriod,setSavingPeriod]     = useState(false);
  const [confirmDelPeriod,setConfirmDelPeriod] = useState(null);
  const [confirmDelNote,setConfirmDelNote]     = useState(null);
  const [viewSynthese,setViewSynthese]         = useState(null);
  const [noteText,setNoteText]     = useState("");
  const [noteChapter,setNoteChapter] = useState("marche");
  const [notePhotos,setNotePhotos] = useState([]); // photos en cours d'ajout : {url, blob}
  const galleryInputRef = useRef(null);
  const cameraInputRef  = useRef(null);
  const currentCardRef = useRef(null);

  // Période courante
  const currentPeriod = periods.find(p=>getPeriodStatus(p)==="current") || periods[0];
  const daysToCompile = currentPeriod ? daysLeft(currentPeriod.endISO) : 0;
  const urg           = urgencyStyle(daysToCompile);

  // Notes de la période courante — recalcul forcé à chaque changement de notes ou périodes
  const periodNotes = currentPeriod
    ? notes.filter(n => n.periodId === currentPeriod.uid && n.periodId !== "pending")
    : [];
  const chapterCounts = {};
  periodNotes.forEach(n=>{chapterCounts[n.chapter]=(chapterCounts[n.chapter]||0)+1;});
  const notesByChapter = CHAPTERS.map(ch=>({chapter:ch,notes:periodNotes.filter(n=>n.chapter===ch.id)})).filter(g=>g.notes.length>0);
  // Total réel pour l'onglet Notes — exclut les notes "pending"
  const totalNotesCount = notes.filter(n => currentPeriod && n.periodId === currentPeriod.uid && n.periodId !== "pending").length;

  // Tri périodes
  const sortedPeriods  = [...periods].sort((a,b)=>new Date(a.startISO)-new Date(b.startISO));
  const pastPeriods    = sortedPeriods.filter(p=>getPeriodStatus(p)==="past").reverse();
  const futurePeriods  = sortedPeriods.filter(p=>getPeriodStatus(p)==="future");

  useEffect(()=>save("nb_notes",notes),[notes]);
  // Demande a iOS de proteger nos donnees locales (photos comprises) de l'effacement auto.
  useEffect(()=>{ requestPersistentStorage(); },[]);
  useEffect(()=>save("nb_syntheses",syntheses),[syntheses]);

  // Charge les périodes depuis CalDAV
  useEffect(()=>{
    if(!auth) return;
    loadPeriods();
  },[auth]);

  // Auto-scroll vers période en cours
  useEffect(()=>{
    if(tab==="rapport"&&currentCardRef.current){
      setTimeout(()=>currentCardRef.current?.scrollIntoView({behavior:"smooth",block:"center"}),150);
    }
  },[tab,periods]);

  useEffect(()=>{ const h=e=>{if(e.ctrlKey&&e.key===" "){e.preventDefault();setCaptureOpen(true);}}; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[]);

  // Re-sync CalDAV — multi-stratégie pour iOS Safari PWA
  useEffect(()=>{
    if(!auth) return;
    // Stratégie 1 : visibilitychange (app rouverte)
    const onVisible=()=>{ if(document.visibilityState==="visible") loadPeriods(true); };
    document.addEventListener("visibilitychange",onVisible);
    // Stratégie 2 : online (retour réseau)
    const onOnline=()=>{ loadPeriods(true); };
    window.addEventListener("online",onOnline);
    // Stratégie 3 : offline (indique à l'user)
    const onOffline=()=>{ setCalAvailable(false); };
    window.addEventListener("offline",onOffline);
    // Stratégie 4 : polling toutes les 90 secondes si app active
    const poll = setInterval(()=>{
      if(document.visibilityState==="visible" && navigator.onLine) loadPeriods(true);
    }, 90000);
    return()=>{
      document.removeEventListener("visibilitychange",onVisible);
      window.removeEventListener("online",onOnline);
      window.removeEventListener("offline",onOffline);
      clearInterval(poll);
    };
  },[auth]);

  const voice = useVoice(t=>{setNoteText(t);setVoiceOpen(false);setCaptureOpen(true);});

  async function loadPeriods(silent=false) {
    // ── STEP 1 : Cache local → affichage IMMÉDIAT, jamais de spinner bloquant ──
    const cached = load("nb_periods_cache", []);
    if(cached.length > 0) {
      setPeriods(cached);
      setLoadingPeriods(false); // Spinner off dès que cache dispo
    } else if(!silent) {
      setLoadingPeriods(true); // Spinner seulement si vraiment vide
    }

    // ── STEP 2 : Sync CalDAV en arrière-plan — timeout 3s agressif ────────────
    // Pattern Stale-While-Revalidate : on affiche le cache, on met à jour en silence
    if(!navigator.onLine) {
      setCalAvailable(false);
      setLoadingPeriods(false);
      return; // Pas de réseau → inutile d'essayer
    }
    try {
      const timeout = new Promise((_,reject) => setTimeout(()=>reject(new Error("timeout")), 3000));
      const sync    = (async () => {
        const calOk = await checkCalendarExists(auth);
        if(!calOk){ setCalAvailable(false); return; }
        const evs = await getPeriodEvents(auth);
        // ── GARDE-FOU : synchro revenue sans aucune période ? On garde le cache. ──
        if(evs.length===0 && load("nb_periods_cache",[]).length>0){ setCalAvailable(true); return; }
        // Mise à jour silencieuse — pas de re-render visible si données identiques
        const cachedStr = JSON.stringify(load("nb_periods_cache",[]));
        const freshStr  = JSON.stringify(evs);
        if(cachedStr !== freshStr) {
          setPeriods(evs);
          save("nb_periods_cache", evs);
        }
        setCalAvailable(true);
      })();
      await Promise.race([sync, timeout]);
    } catch {
      // Silencieux — réseau lent ou absent → on garde le cache, UI non bloquée
      // calAvailable reste true si on a du cache — pas de bandeau amber intempestif
      if(cached.length === 0) setCalAvailable(false);
    }
    setLoadingPeriods(false);
  }

  // ── Photos de la note en cours de creation ──
  async function handlePhotoFiles(fileList){
    const files = Array.from(fileList||[]);
    for(const file of files){
      try{
        const blob = await compressImage(file);   // reduit le poids avant stockage
        const url  = URL.createObjectURL(blob);    // apercu instantane
        setNotePhotos(prev=>[...prev,{url,blob}]);
      }catch(e){ /* image illisible : on ignore ce fichier */ }
    }
  }
  function removeNotePhoto(index){
    setNotePhotos(prev=>{
      const p=prev[index]; if(p) URL.revokeObjectURL(p.url);
      return prev.filter((_,i)=>i!==index);
    });
  }
  function clearNotePhotos(){
    setNotePhotos(prev=>{ prev.forEach(p=>URL.revokeObjectURL(p.url)); return []; });
  }
  function closeCapture(){ clearNotePhotos(); setCaptureOpen(false); }

  async function addNote(){
    if(!noteText.trim()) return;
    // Range les photos au vestiaire (IndexedDB) -> un ticket par photo.
    const photoIds=[];
    for(const p of notePhotos){
      try{ const pid=await savePhoto(p.blob); photoIds.push(pid); }catch(e){ /* echec stockage : photo ignoree */ }
    }
    // Si pas de période encore chargée → note en attente rattachée à "pending"
    const periodId = currentPeriod?.uid || "pending";
    const note={id:Date.now(),text:noteText.trim(),chapter:noteChapter,createdAt:new Date().toISOString(),periodId,photos:photoIds};
    setNotes(prev=>[note,...prev]);
    setNoteText(""); clearNotePhotos(); setCaptureOpen(false);
    // Sync nb notes dans l'event CalDAV
    if(auth&&currentPeriod?.href){
      import("../utils/caldavCalendar.js").then(({syncNoteCount})=>{
        syncNoteCount(auth,currentPeriod.href,{...currentPeriod,noteCount:periodNotes.length+1});
      });
    }
  }

  function editNote(id,{text,chapter,photos}){
    setNotes(prev=>prev.map(n=>n.id===id?{...n,text,chapter,...(photos!==undefined?{photos}:{}),editedAt:new Date().toISOString()}:n));
  }

  async function handleSavePeriod({startISO,endISO,label,rrule}){
    if(!auth||!startISO||!endISO) return;
    // ── Interdit le chevauchement de périodes ─────────────────────────────────
    const overlap = periods.find(p => {
      if(editingPeriod && p.uid === editingPeriod.uid) return false; // Ignore la période en cours d'édition
      return startISO < p.endISO && endISO > p.startISO;
    });
    if(overlap) {
      alert(`⚠️ Cette période chevauche "${overlap.label}".
Veuillez choisir des dates sans chevauchement.`);
      return;
    }
    setSavingPeriod(true);
    try{
      if(editingPeriod){
        // Modification
        const result = await updatePeriodEvent(auth, editingPeriod.href, {startISO,endISO,label,rrule,noteCount:notes.filter(n=>n.periodId===editingPeriod.uid).length});
        if(result.success) await loadPeriods();
      } else {
        // Création
        const result = await createPeriodEvent(auth,{startISO,endISO,label,rrule});
        if(result.success) await loadPeriods();
      }
    }catch{}
    setSavingPeriod(false);
    setPeriodFormOpen(false);
    setEditingPeriod(null);
  }

  async function handleDeletePeriod(p){
    if(!auth||!p.href) return;
    await deletePeriodEvent(auth,p.href);
    // ── Suppression optimiste : on retire la période du cache TOUT DE SUITE ──
    // (la synchro suivante ne fait que confirmer ; le garde-fou ne peut plus la "ressusciter")
    const pruned = load("nb_periods_cache",[]).filter(x=>x.uid!==p.uid);
    setPeriods(pruned);
    save("nb_periods_cache", pruned);
    // Supprime aussi les notes locales de cette période
    setNotes(prev=>prev.filter(n=>n.periodId!==p.uid));
    await loadPeriods(true);
    setConfirmDelPeriod(null);
  }

  // Retour NomadCal via icône calendrier dans le header

  const btnBase    = { fontSize:13, fontWeight:700, borderRadius:9, padding:"7px 4px", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flex:1, textAlign:"center", width:"100%", boxSizing:"border-box" };
  const btnStyle   = { ...btnBase, border:`1px solid ${C.accentBorder}`, background:C.accentLight, color:C.accent };
  const btnPrimary = { ...btnBase, background:C.accent, color:"#fff", border:"none" };
  const btnActive  = { ...btnBase, background:C.accent, color:"#fff", border:"none" };

  const lastEndISO = sortedPeriods.length > 0 ? sortedPeriods[sortedPeriods.length-1].endISO : null;

  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:"'Phenomena','Nunito',sans-serif",position:"relative"}}>

      {/* ── Header jumeau NomadCal ── */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px 4px"}}>
          <span style={{fontSize:34,fontWeight:800,color:C.accent,fontFamily:"Phenomena,sans-serif",letterSpacing:-1,lineHeight:1}}>NomadBook</span>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>onClose?onClose():window.location.href="https://cal-flow-jade.vercel.app"} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><IconCalendar/></button>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 14px 6px"}}>
          <span style={{fontSize:15,color:C.ink,fontWeight:700,fontFamily:"Phenomena,sans-serif"}}>
            {currentPeriod ? currentPeriod.label : "Aucune période"}
          </span>
          {currentPeriod&&<span style={{fontSize:13,color:urg.color,fontWeight:600}}>Compilation le {fmt(currentPeriod.endISO)} — {urg.label}</span>}
        </div>
        <div style={{display:"flex",gap:6,padding:"0 14px 8px"}}>
          <button onClick={()=>{setVoiceOpen(true);voice.start();}} style={{...btnStyle,display:"flex",alignItems:"center",justifyContent:"center",gap:5,color:voice.listening?C.red:C.accent,borderColor:voice.listening?C.red:C.accentBorder}}>
            <IconMic active={voice.listening}/>Micro
          </button>
          <button onClick={()=>setTab("notes")} style={{...(tab==="notes"?btnActive:btnStyle),display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <IconNotes active={tab==="notes"}/>Notes
            {totalNotesCount>0&&<span style={{background:tab==="notes"?"rgba(255,255,255,0.3)":C.accent,color:"#fff",borderRadius:10,fontSize:10,fontWeight:800,padding:"1px 5px",lineHeight:1.4}}>{totalNotesCount}</span>}
          </button>
          <button onClick={()=>setTab("rapport")} style={{...(tab==="rapport"?btnActive:btnStyle),display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <IconRapport/>Rapport
          </button>
          <button onClick={()=>setCaptureOpen(true)} style={{...btnPrimary,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
            + Note
          </button>
        </div>
      </div>

      {/* Bandeau amber — seulement si PAS de cache ET PAS de réseau */}
      {!calAvailable&&!loadingPeriods&&periods.length===0&&(
        <div style={{background:C.amberLight,border:`1px solid ${C.gold}`,margin:"8px 16px",borderRadius:10,padding:"10px 14px",fontSize:12,color:C.amber,fontWeight:600}}>
          📅 Mode hors ligne — vos données locales sont disponibles.
          <button onClick={()=>{ setCalAvailable(true); loadPeriods(true); }} style={{background:"none",border:"none",color:C.accent,cursor:"pointer",fontSize:12,fontWeight:700,marginLeft:8}}>Réessayer</button>
        </div>
      )}

      <div style={{maxWidth:680,margin:"0 auto",padding:"16px 16px 80px"}}>

        {/* NOTES */}
        {tab==="notes"&&(
          <div>
            {!currentPeriod&&!loadingPeriods&&(
              <div style={{textAlign:"center",color:C.subtle,padding:"60px 0",fontSize:15}}>
                <div style={{fontSize:40,marginBottom:16}}>📋</div>
                Aucune période de rapport.<br/>
                <span style={{fontSize:13}}>Crée ta première période ci-dessous.</span>
                <div style={{marginTop:20}}>
                  <Btn variant="primary" onClick={()=>{setEditingPeriod(null);setPeriodFormOpen(true);}}>+ Créer une période</Btn>
                </div>
              </div>
            )}
            {currentPeriod&&periodNotes.length===0&&(
              <div style={{textAlign:"center",color:C.subtle,padding:"60px 0",fontSize:15}}>
                <div style={{fontSize:40,marginBottom:16}}>📋</div>
                Aucune note pour cette période.<br/>
                <span style={{fontSize:13}}>Appuie sur + Note ou utilise le micro.</span>
              </div>
            )}
            {currentPeriod&&notesByChapter.length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:24}}>
                {notesByChapter.map(({chapter,notes:chNotes})=>(
                  <div key={chapter.id}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>
                      <ChapterIcon id={chapter.id} size={14}/>
                      <span style={{fontSize:12,fontWeight:700,color:chapter.id==="alertes"?C.red:C.accent,textTransform:"uppercase",letterSpacing:.5}}>{chapter.label}</span>
                      <span style={{fontSize:11,color:C.muted,marginLeft:"auto"}}>{chNotes.length} note{chNotes.length>1?"s":""}</span>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {chNotes.map(note=>(<NoteCard key={note.id} note={note} onDelete={id=>setConfirmDelNote(id)} onEdit={editNote}/>))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RAPPORT — Calendrier 2 ans */}
        {tab==="rapport"&&(
          <div>
            {loadingPeriods&&periods.length===0&&(
              <div style={{textAlign:"center",color:C.muted,padding:"40px 0",fontSize:14}}>
                Chargement des périodes…
              </div>
            )}

            {!loadingPeriods&&periods.length===0&&(
              <div style={{textAlign:"center",color:C.subtle,padding:"60px 0",fontSize:15}}>
                <div style={{fontSize:40,marginBottom:16}}>📅</div>
                Aucune période de rapport.<br/>
                <div style={{marginTop:20}}>
                  <Btn variant="primary" onClick={()=>{setEditingPeriod(null);setPeriodFormOpen(true);}}>+ Créer ma première période</Btn>
                </div>
              </div>
            )}

            {!loadingPeriods&&periods.length>0&&(<>
              {/* Indicateur */}
              <div style={{fontSize:11,color:C.muted,textAlign:"center",marginBottom:16,fontWeight:600,letterSpacing:.5}}>
                {pastPeriods.length} passée{pastPeriods.length>1?"s":""} · {currentPeriod?1:0} en cours · {futurePeriods.length} à venir
              </div>

              {/* PASSÉS */}
              {pastPeriods.length>0&&(<>
                <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:C.border,display:"inline-block"}}/>Archivés
                </div>
                {[...pastPeriods].reverse().map((p,i)=>(
                  <PeriodCard key={p.uid||p.href} p={p} status="past"
                    noteCount={notes.filter(n=>n.periodId===p.uid).length}
                    chapterCounts={{}} totalNotes={0}
                    synthese={syntheses[p.uid]}
                    index={sortedPeriods.findIndex(pp=>pp.uid===p.uid)} total={periods.length}
                    onTap={p=>{ if(syntheses[p.uid]) setViewSynthese({period:p,text:syntheses[p.uid].text,date:syntheses[p.uid].date}); }}
                    onEdit={p=>{ setEditingPeriod(p); setPeriodFormOpen(true); }}
                    onDelete={p=>setConfirmDelPeriod(p)}
                  />
                ))}
              </>)}

              {/* EN COURS */}
              {currentPeriod&&(<>
                <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
                  <div style={{flex:1,height:1,background:C.gold}}/>
                  <span style={{fontSize:11,fontWeight:800,color:C.amber,letterSpacing:.5}}>PÉRIODE EN COURS</span>
                  <div style={{flex:1,height:1,background:C.gold}}/>
                </div>
                <div ref={currentCardRef}>
                  <PeriodCard p={currentPeriod} status="current"
                    noteCount={periodNotes.length}
                    chapterCounts={chapterCounts} totalNotes={periodNotes.length}
                    synthese={syntheses[currentPeriod.uid]}
                    index={sortedPeriods.findIndex(p=>p.uid===currentPeriod.uid)} total={periods.length}
                    onTap={()=>{ if(syntheses[currentPeriod.uid]) setViewSynthese({period:currentPeriod,text:syntheses[currentPeriod.uid].text,date:syntheses[currentPeriod.uid].date}); }}
                    onEdit={p=>{ setEditingPeriod(p); setPeriodFormOpen(true); }}
                    onDelete={p=>setConfirmDelPeriod(p)}
                  />
                  {/* ── Pavé d'actions de la période en cours ── */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:4,marginBottom:8}}>
                    {/* Brainstorming — version payante (à venir) */}
                    <div style={{position:"relative",borderRadius:11,padding:"13px 8px",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:C.bg,color:C.subtle,border:`1.5px solid ${C.border}`}}>
                      <span style={{position:"absolute",top:-7,right:8,background:C.gold,color:"#5a3c00",fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:6,letterSpacing:.3}}>à venir</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.7 4.6L18.5 9l-4.8 1.4L12 15l-1.7-4.6L5.5 9l4.8-1.4L12 3z" stroke={C.subtle} strokeWidth="1.5" strokeLinejoin="round"/></svg>
                      Brainstorming
                    </div>
                    {/* Copier — actif (copie le rapport de la période si présent) */}
                    <button onClick={e=>{ const s=syntheses[currentPeriod.uid]; const t=e.currentTarget; if(s&&s.text){ navigator.clipboard.writeText(s.text); t.style.color=C.green; t.style.borderColor=C.green; setTimeout(()=>{t.style.color=C.accent;t.style.borderColor=C.accentBorder;},1200); if(navigator.vibrate)navigator.vibrate(10);} }}
                      style={{borderRadius:11,padding:"13px 8px",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:"#fff",color:C.accent,border:`1.5px solid ${C.accentBorder}`,cursor:"pointer"}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="11" height="12" rx="2" stroke="#2B5A9E" strokeWidth="1.6"/><path d="M5 16V5a2 2 0 012-2h9" stroke="#F5C97A" strokeWidth="1.6" strokeLinecap="round"/></svg>
                      Copier
                    </button>
                    {/* Export PDF — réservé (V2) */}
                    <div style={{position:"relative",borderRadius:11,padding:"13px 8px",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:C.bg,color:C.subtle,border:`1.5px solid ${C.border}`}}>
                      <span style={{position:"absolute",top:-7,right:8,background:C.gold,color:"#5a3c00",fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:6,letterSpacing:.3}}>à venir</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 4v9m0 0l-3-3m3 3l3-3" stroke={C.subtle} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 16v2a2 2 0 002 2h10a2 2 0 002-2v-2" stroke={C.subtle} strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Export PDF
                    </div>
                    {/* Archives — réservé */}
                    <div style={{position:"relative",borderRadius:11,padding:"13px 8px",fontSize:13,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:C.bg,color:C.subtle,border:`1.5px solid ${C.border}`}}>
                      <span style={{position:"absolute",top:-7,right:8,background:C.gold,color:"#5a3c00",fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:6,letterSpacing:.3}}>à venir</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="4" y="6" width="16" height="14" rx="2" stroke={C.subtle} strokeWidth="1.5"/><path d="M4 10h16M9.5 14h5" stroke={C.subtle} strokeWidth="1.5" strokeLinecap="round"/></svg>
                      Archives
                    </div>
                  </div>
                </div>
              </>)}

              {/* FUTURS */}
              {futurePeriods.length>0&&(<>
                <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
                  <div style={{flex:1,height:1,background:C.accentBorder}}/>
                  <span style={{fontSize:11,fontWeight:800,color:C.accent,letterSpacing:.5}}>À VENIR</span>
                  <div style={{flex:1,height:1,background:C.accentBorder}}/>
                </div>
                {futurePeriods.map((p,i)=>(
                  <PeriodCard key={p.uid||p.href} p={p} status="future"
                    noteCount={notes.filter(n=>n.periodId===p.uid).length}
                    chapterCounts={{}} totalNotes={0}
                    synthese={null}
                    index={sortedPeriods.findIndex(pp=>pp.uid===p.uid)} total={periods.length}
                    onTap={()=>{}}
                    onEdit={p=>{ setEditingPeriod(p); setPeriodFormOpen(true); }}
                    onDelete={p=>setConfirmDelPeriod(p)}
                  />
                ))}
              </>)}

              <Btn onClick={()=>{setEditingPeriod(null);setPeriodFormOpen(true);}} variant="soft" style={{width:"100%",justifyContent:"center",display:"flex",marginTop:8}}>
                + Nouvelle période
              </Btn>
            </>)}
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      {/* Formulaire période */}
      <Modal open={periodFormOpen} onClose={()=>{setPeriodFormOpen(false);setEditingPeriod(null);}}
        title={editingPeriod?"Modifier la période":"+ Nouvelle période"}>
        <PeriodForm
          initial={editingPeriod}
          lastEndISO={lastEndISO}
          onSave={handleSavePeriod}
          onCancel={()=>{setPeriodFormOpen(false);setEditingPeriod(null);}}
          loading={savingPeriod}
        />
      </Modal>

      {/* Confirmer suppression période */}
      {confirmDelPeriod&&(
        <Modal open={true} onClose={()=>setConfirmDelPeriod(null)} title="Supprimer la période">
          <p style={{fontSize:14,color:C.muted,lineHeight:1.6,marginBottom:20}}>
            Supprimer <strong>{confirmDelPeriod.label}</strong> de votre iCloud ?<br/>
            <span style={{fontSize:12,color:C.subtle}}>Les notes locales associées seront aussi supprimées. Action irréversible.</span>
          </p>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setConfirmDelPeriod(null)}>Annuler</Btn>
            <Btn variant="danger" onClick={()=>handleDeletePeriod(confirmDelPeriod)}>Supprimer</Btn>
          </div>
        </Modal>
      )}

      {/* Confirmer suppression note */}
      {confirmDelNote&&(
        <Modal open={true} onClose={()=>setConfirmDelNote(null)} title="Supprimer la note">
          <p style={{fontSize:14,color:C.muted,lineHeight:1.6,marginBottom:20}}>
            Supprimer cette note définitivement ?<br/>
            <span style={{fontSize:12,color:C.subtle}}>Action irréversible.</span>
          </p>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>setConfirmDelNote(null)}>Annuler</Btn>
            <Btn variant="danger" onClick={()=>{setNotes(p=>p.filter(n=>n.id!==confirmDelNote));setConfirmDelNote(null);}}>Supprimer</Btn>
          </div>
        </Modal>
      )}

      {/* Voir synthèse archivée */}
      {viewSynthese&&(
        <Modal open={true} onClose={()=>setViewSynthese(null)} title={`Synthèse — ${viewSynthese.period.label}`} wide={true}>
          <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Générée le {new Date(viewSynthese.date).toLocaleDateString("fr-FR")}</div>
          <div style={{fontSize:13,lineHeight:1.8,color:C.ink,whiteSpace:"pre-wrap",background:C.bg,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.border}`,marginBottom:16}}>
            {viewSynthese.text}
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <Btn onClick={()=>navigator.clipboard.writeText(viewSynthese.text)} variant="soft">Copier</Btn>
            <Btn onClick={()=>{const sub=encodeURIComponent(`${viewSynthese.period.label} — Rapport terrain`);window.location.href=`mailto:?subject=${sub}&body=${encodeURIComponent(viewSynthese.text)}`;}} variant="outline">Envoyer</Btn>
          </div>
        </Modal>
      )}

      {/* Capture note */}
      <Modal open={captureOpen} onClose={closeCapture} title="Nouvelle note">
        {!currentPeriod&&(
          <div style={{background:C.amberLight,border:`1px solid ${C.gold}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13,color:C.amber,fontWeight:600}}>
            Aucune période active — crée une période d'abord dans l'onglet Rapport
          </div>
        )}
        {currentPeriod&&(
          <div style={{background:C.accentLight,border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"8px 12px",marginBottom:16,fontSize:12,color:C.accent,fontWeight:600}}>
            Rattachée à : <strong>{currentPeriod.label}</strong> · compilation le {fmt(currentPeriod.endISO)}
          </div>
        )}
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12,color:C.muted,display:"block",marginBottom:8,fontWeight:600}}>Chapitre</label>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
            {CHAPTERS.map(c=>(
              <button key={c.id} onClick={()=>setNoteChapter(c.id)} style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,padding:"6px 12px",borderRadius:20,border:`1.5px solid ${noteChapter===c.id?C.accent:C.border}`,background:noteChapter===c.id?C.accent:C.bg,color:noteChapter===c.id?"#fff":C.muted,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",flexShrink:0}}>
                <ChapterIcon id={c.id} size={10}/>{c.label}
              </button>
            ))}
          </div>
        </div>
        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={4} placeholder="Ta note terrain…" autoFocus onKeyDown={e=>{if(e.metaKey&&e.key==="Enter")addNote();}} style={{...inputStyle,resize:"vertical",marginBottom:12,lineHeight:1.6}}/>
        {/* ── Photos ── */}
        <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{handlePhotoFiles(e.target.files); e.target.value="";}}/>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>{handlePhotoFiles(e.target.files); e.target.value="";}}/>
        <div style={{display:"flex",gap:8,marginBottom:notePhotos.length>0?12:16}}>
          <button onClick={()=>galleryInputRef.current?.click()} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13,fontWeight:600,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${C.accentBorder}`,background:C.accentLight,color:C.accent,cursor:"pointer",fontFamily:"inherit"}}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="2.5" y="4" width="15" height="12" rx="2" stroke="#2B5A9E" strokeWidth="1.5"/><circle cx="7" cy="8.5" r="1.5" fill="#F5C97A"/><path d="M3 14l4-4 3 3 3-3 4 4" stroke="#2B5A9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Ajouter photo
          </button>
          <button onClick={()=>cameraInputRef.current?.click()} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13,fontWeight:600,padding:"9px 12px",borderRadius:10,border:`1.5px solid ${C.accentBorder}`,background:C.accentLight,color:C.accent,cursor:"pointer",fontFamily:"inherit"}}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 6.5h2.5L7 4.5h6L14.5 6.5H17a1 1 0 011 1V15a1 1 0 01-1 1H3a1 1 0 01-1-1V7.5a1 1 0 011-1z" stroke="#2B5A9E" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="10" cy="11" r="3" stroke="#F5C97A" strokeWidth="1.5"/></svg>
            Prendre photo
          </button>
        </div>
        {notePhotos.length>0&&(
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
            {notePhotos.map((p,i)=><PhotoThumb key={i} url={p.url} size={64} onRemove={()=>removeNotePhoto(i)}/>)}
          </div>
        )}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
          <Btn onClick={closeCapture}>Annuler</Btn>
          <Btn onClick={addNote} variant="primary" disabled={!noteText.trim()}>
            {!currentPeriod?"⏳ En attente période…":"Enregistrer"}
          </Btn>
        </div>
      </Modal>

      {/* Dictée vocale */}
      <Modal open={voiceOpen} onClose={()=>{voice.stop();setVoiceOpen(false);}} title="Dictée vocale">
        <div style={{textAlign:"center",padding:"12px 0"}}>
          <div style={{width:72,height:72,borderRadius:"50%",margin:"0 auto 16px",background:voice.listening?C.redLight:C.bg,border:`2px solid ${voice.listening?C.red:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .3s"}}>
            <IconMic active={voice.listening}/>
          </div>
          <p style={{fontWeight:700,color:voice.listening?C.red:C.muted,marginBottom:12}}>{voice.listening?"Parle maintenant…":"Traitement en cours…"}</p>
          {voice.transcript&&(<div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",textAlign:"left",fontSize:14,lineHeight:1.65,marginBottom:16}}>{voice.transcript}</div>)}
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            {voice.listening?<Btn onClick={voice.stop} variant="danger">Arrêter</Btn>:voice.transcript&&<><Btn onClick={()=>{voice.discard();setVoiceOpen(false);}}>Annuler</Btn><Btn onClick={voice.confirm} variant="primary">Confirmer</Btn></>}
          </div>
        </div>
      </Modal>

      {/* Brainstorming IA */}
      {currentPeriod&&(
        <Modal open={chatOpen} onClose={()=>setChatOpen(false)} title={`Brainstorming — ${currentPeriod.label}`} wide={true}>
          <AIChat period={currentPeriod} notes={periodNotes} onReportSaved={text=>{setSyntheses(prev=>({...prev,[currentPeriod.uid]:{text,date:new Date().toISOString()}}));}}/>
        </Modal>
      )}

      <style>{`* { box-sizing: border-box; } @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} } ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#d4c9b8;border-radius:4px} textarea:focus, input:focus { border-color: #2B5A9E !important; } button:active { transform: scale(.97); }`}</style>
    </div>
  );
}
