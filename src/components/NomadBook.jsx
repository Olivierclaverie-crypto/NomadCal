import { useState, useEffect, useRef } from "react";
 
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
const CHAPTERS = [
  { id:"marche",       emoji:"📊", label:"Marché" },
  { id:"nouveautes",   emoji:"🆕", label:"Nouveautés" },
  { id:"logistique",   emoji:"🚚", label:"Logistique" },
  { id:"propositions", emoji:"💡", label:"Propositions" },
  { id:"performances", emoji:"🏆", label:"Performances" },
  { id:"alertes",      emoji:"⚠️", label:"Alertes" },
  { id:"reassorts",    emoji:"🔄", label:"Réassorts" },
  { id:"operations",   emoji:"🎯", label:"Opérations en cours" },
  { id:"saisonnalite", emoji:"🎄", label:"Saisonnalité" },
  { id:"dedicaces",    emoji:"✍️", label:"Demandes de dédicace" },
  { id:"compagnon",    emoji:"💻", label:"Compagnon" },
];
const DEFAULT_PERIODS = [
  { id:"s1", start:"2026-05-22", end:"2026-06-01", label:"Rapport Mai" },
  { id:"s2", start:"2026-06-01", end:"2026-07-06", label:"Rapport Juin–Juillet" },
  { id:"s3", start:"2026-07-06", end:"2026-09-07", label:"Rapport Juil–Août" },
  { id:"s4", start:"2026-09-07", end:"2026-10-05", label:"Rapport Sept–Oct" },
  { id:"s5", start:"2026-10-05", end:"2026-11-02", label:"Rapport Oct–Nov" },
  { id:"s6", start:"2026-11-02", end:"2026-12-07", label:"Rapport Nov–Déc" },
];
const IMPORTED_NOTES = [
  { id:"imp1",  text:"Attention offre stick",                                                                               chapter:"alertes",      createdAt:"2026-05-22T08:00:00", imported:true },
  { id:"imp2",  text:"Forte baisse en hyper Peppa — prudence sur navres PatPat (65% écoulement Osny à Noël)",              chapter:"alertes",      createdAt:"2026-05-22T08:01:00", imported:true },
  { id:"imp3",  text:"Possibilité d'extraire fiches articles Compagnon en JPEG/PNG pour corps de mail",                    chapter:"propositions", createdAt:"2026-05-22T08:02:00", imported:true },
  { id:"imp4",  text:"Dans les e-mails : alerter François avec EAN plutôt que nuart",                                      chapter:"logistique",   createdAt:"2026-05-22T08:03:00", imported:true },
  { id:"imp5",  text:"CGT adresse Fosses à vérifier",                                                                      chapter:"logistique",   createdAt:"2026-05-22T08:04:00", imported:true },
  { id:"imp6",  text:"Encore des soucis de livraison à Chambly",                                                           chapter:"logistique",   createdAt:"2026-05-22T08:05:00", imported:true },
  { id:"imp7",  text:"Couverture France en train — à surveiller",                                                          chapter:"marche",       createdAt:"2026-05-22T08:06:00", imported:true },
  { id:"imp8",  text:"Avoir dates de dispo Compagnon des BdC : coffrets sept, coffrets T4, Enjeux Jeun & Adultes, Noël",  chapter:"nouveautes",   createdAt:"2026-05-22T08:07:00", imported:true },
  { id:"imp9",  text:"Création mobilier permanent assortiment coffrets (loisirs créa Eyrolles)",                           chapter:"operations",   createdAt:"2026-05-22T08:08:00", imported:true },
  { id:"imp10", text:"Bonnes performances des beaux livres voyages (VDM)",                                                 chapter:"performances", createdAt:"2026-05-22T08:09:00", imported:true },
];
const fmt     = d => new Date(d).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"});
const daysLeft= d => Math.ceil((new Date(d)-new Date())/86400000);
const load    = (k,def) => { try{ const v=localStorage.getItem(k); return v?JSON.parse(v):def; }catch{ return def; } };
const save    = (k,v)   => { try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} };
function getCurrentPeriod(periods){ const now=new Date(); return periods.find(p=>now>=new Date(p.start)&&now<new Date(p.end))||periods[0]; }
function urgencyStyle(days){ if(days<0) return {color:C.red,bg:C.redLight,label:"Dépassé"}; if(days===0) return {color:C.red,bg:C.redLight,label:"Aujourd'hui"}; if(days<=3) return {color:C.amber,bg:C.amberLight,label:`J-${days}`}; if(days<=10) return {color:C.accent,bg:C.accentLight,label:`J-${days}`}; return {color:C.green,bg:C.greenLight,label:`J-${days}`}; }
function chapterById(id){ return CHAPTERS.find(c=>c.id===id)||CHAPTERS[0]; }
function Pill({children,color=C.accent,bg=C.accentLight}){ return <span style={{fontSize:11,fontWeight:700,color,background:bg,padding:"2px 8px",borderRadius:20}}>{children}</span>; }
function Btn({onClick,children,variant="ghost",style={},disabled=false}){ const base={border:"none",cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",borderRadius:8,fontSize:13,fontWeight:600,padding:"8px 16px",transition:"all .15s",opacity:disabled?.5:1}; const variants={ghost:{background:"transparent",color:C.muted},primary:{background:C.accent,color:"#fff",boxShadow:`0 2px 8px ${C.accent}44`},outline:{background:"transparent",color:C.accent,border:`1.5px solid ${C.accent}`},soft:{background:C.accentLight,color:C.accent,border:`1px solid ${C.accentBorder}`},danger:{background:C.redLight,color:C.red,border:`1px solid ${C.red}44`}}; return <button onClick={disabled?undefined:onClick} style={{...base,...variants[variant],...style}}>{children}</button>; }
function Modal({open,onClose,title,children,wide=false}){ if(!open) return null; return(<div style={{position:"fixed",inset:0,background:"rgba(26,23,20,.55)",backdropFilter:"blur(4px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}><div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:wide?640:460,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,.18)"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}><span style={{fontWeight:700,fontSize:17,color:C.ink,letterSpacing:-.3}}>{title}</span><button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.subtle,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:8}}>✕</button></div>{children}</div></div>); }
const inputStyle = { background:C.bg, border:`1.5px solid ${C.border}`, color:C.ink, padding:"10px 14px", borderRadius:10, fontSize:14, outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box", transition:"border-color .15s" };
function useVoice(onConfirm){ const rec=useRef(null); const [listening,setListening]=useState(false); const [transcript,setTranscript]=useState(""); const start=()=>{ const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){alert("Dictée vocale non supportée.");return;} const r=new SR(); r.lang="fr-FR"; r.continuous=false; r.interimResults=true; r.onresult=e=>{const t=Array.from(e.results).map(x=>x[0].transcript).join("");setTranscript(t);}; r.onend=()=>setListening(false); r.start(); rec.current=r; setListening(true); setTranscript(""); }; const stop=()=>rec.current?.stop(); const confirm=()=>{if(transcript.trim()){onConfirm(transcript.trim());setTranscript("");}}; const discard=()=>setTranscript(""); return {listening,transcript,start,stop,confirm,discard}; }
function AIChat({period,notes}){ const [messages,setMessages]=useState([]); const [input,setInput]=useState(""); const [loading,setLoading]=useState(false); const [report,setReport]=useState(""); const bottomRef=useRef(); const initialized=useRef(false); useEffect(()=>{ if(initialized.current) return; initialized.current=true; const byChapter={}; notes.forEach(n=>{if(!byChapter[n.chapter])byChapter[n.chapter]=[];byChapter[n.chapter].push(n.text);}); const intro=`Bonjour ! Je suis prêt pour le brainstorming du **${period.label}** (compilation le ${fmt(period.end)}).\n\nJ'ai ${notes.length} note(s) réparties en ${Object.keys(byChapter).length} chapitre(s). Quelques questions pour affiner le rapport avant de le générer :`; setMessages([{role:"assistant",content:intro}]); },[]); useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[messages]); async function send(){ if(!input.trim()||loading) return; const userMsg={role:"user",content:input.trim()}; const newMessages=[...messages,userMsg]; setMessages(newMessages); setInput(""); setLoading(true); const byChapter={}; notes.forEach(n=>{if(!byChapter[n.chapter])byChapter[n.chapter]=[];byChapter[n.chapter].push(n.text);}); const notesText=CHAPTERS.filter(c=>byChapter[c.id]).map(c=>`### ${c.emoji} ${c.label}\n${byChapter[c.id].map(t=>`- ${t}`).join("\n")}`).join("\n\n"); try{ const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,system:`Tu es un assistant de terrain pour un commercial éditorial expérimenté. Période : ${period.label} (du ${fmt(period.start)} au ${fmt(period.end)}). Notes terrain par chapitre :\n${notesText}\n\nAide à brainstormer et affiner le rapport. Quand l'utilisateur demande le rapport final, génère un rapport professionnel structuré par chapitres, avec pour chaque chapitre : synthèse des points clés, actions recommandées. Termine par une section "Points prioritaires" avec les 3-5 actions urgentes. Ton : professionnel, concis, orienté action. En français.`,messages:newMessages.map(m=>({role:m.role,content:m.content}))})}); const data=await res.json(); const reply=data.content?.map(b=>b.text||"").join("")||"Erreur."; setMessages(prev=>[...prev,{role:"assistant",content:reply}]); if(reply.length>600&&(reply.includes("##")||reply.includes("Points prioritaires"))) setReport(reply); }catch{ setMessages(prev=>[...prev,{role:"assistant",content:"Erreur de connexion."}]); } setLoading(false); } return(<div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{maxHeight:340,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,padding:"4px 0"}}>{messages.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"85%",padding:"10px 14px",borderRadius:14,fontSize:14,lineHeight:1.65,background:m.role==="user"?C.accent:C.bg,color:m.role==="user"?"#fff":C.ink,borderBottomRightRadius:m.role==="user"?3:14,borderBottomLeftRadius:m.role==="assistant"?3:14,border:m.role==="assistant"?`1px solid ${C.border}`:"none",whiteSpace:"pre-wrap"}}>{m.content}</div></div>))}{loading&&(<div style={{display:"flex",alignItems:"center",gap:8,color:C.muted,fontSize:13,padding:"4px 0"}}><span style={{display:"flex",gap:4}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:C.subtle,animation:`bounce 1s ${i*.2}s infinite`}}/>)}</span>Claude rédige…</div>)}<div ref={bottomRef}/></div><div style={{display:"flex",gap:8}}><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder='Réponds ou dis "génère le rapport final"…' style={{...inputStyle,flex:1,fontSize:13}}/><Btn onClick={send} variant="primary" disabled={loading} style={{padding:"10px 14px"}}>→</Btn></div>{report&&(<div style={{background:C.greenLight,border:`1.5px solid ${C.green}44`,borderRadius:12,padding:14,marginTop:4}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><span style={{color:C.green,fontSize:13,fontWeight:700}}>✓ Rapport prêt à l'export</span><div style={{display:"flex",gap:8}}><Btn onClick={()=>navigator.clipboard.writeText(report)} variant="outline" style={{fontSize:12,padding:"5px 12px"}}>📋 Copier</Btn><Btn onClick={()=>{const sub=encodeURIComponent(`${period.label} — Rapport terrain`);window.location.href=`mailto:?subject=${sub}&body=${encodeURIComponent(report)}`;}} variant="outline" style={{fontSize:12,padding:"5px 12px"}}>📧 Envoyer</Btn></div></div></div>)}</div>); }
function NoteCard({note,onDelete,onEdit,selectMode,selected,onToggleSelect}){ const [editing,setEditing]=useState(false); const [editText,setEditText]=useState(note.text); const [editChapter,setEditChapter]=useState(note.chapter); const [swiped,setSwiped]=useState(false); const touchStartX=useRef(null); const ch=chapterById(note.chapter); function saveEdit(){ if(!editText.trim()) return; onEdit(note.id,{text:editText.trim(),chapter:editChapter}); setEditing(false); } function cancelEdit(){ setEditText(note.text); setEditChapter(note.chapter); setEditing(false); } if(editing){ return(<div style={{background:C.surface,borderRadius:12,padding:"16px",border:`2px solid ${C.accent}`,boxShadow:`0 0 0 3px ${C.accentLight}`}}><div style={{marginBottom:12}}><div style={{fontSize:11,color:C.muted,fontWeight:600,marginBottom:8}}>Chapitre</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{CHAPTERS.map(c=>(<button key={c.id} onClick={()=>setEditChapter(c.id)} style={{fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:20,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",border:`1.5px solid ${editChapter===c.id?C.accent:C.border}`,background:editChapter===c.id?C.accent:C.bg,color:editChapter===c.id?"#fff":C.muted}}>{c.emoji} {c.label}</button>))}</div></div><textarea value={editText} onChange={e=>setEditText(e.target.value)} rows={3} autoFocus style={{...inputStyle,resize:"vertical",marginBottom:12,lineHeight:1.6}}/><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={cancelEdit} variant="ghost" style={{fontSize:12,padding:"6px 12px"}}>Annuler</Btn><Btn onClick={saveEdit} variant="primary" style={{fontSize:12,padding:"6px 14px"}} disabled={!editText.trim()}>✓ Enregistrer</Btn></div></div>); } return(<div style={{position:"relative",overflow:"hidden",borderRadius:12}}><div style={{position:"absolute",right:0,top:0,bottom:0,width:80,background:C.red,display:"flex",alignItems:"center",justifyContent:"center",opacity:swiped?1:0,transition:"opacity .2s"}}><button onClick={()=>onDelete(note.id)} style={{background:"none",border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🗑 Suppr.</button></div><div onClick={()=>{if(selectMode) onToggleSelect();}} onTouchStart={e=>{touchStartX.current=e.touches[0].clientX;}} onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-(touchStartX.current||0); if(dx<-50){setSwiped(true);}else if(dx>20){setSwiped(false);} touchStartX.current=null;}} style={{background:selected?C.accentLight:C.surface,borderRadius:12,padding:"14px 16px",border:`1.5px solid ${selected?C.accent:C.border}`,display:"flex",gap:12,alignItems:"flex-start",transition:"transform .2s",transform:swiped?"translateX(-80px)":"translateX(0)",cursor:selectMode?"pointer":"default",opacity:note.imported?.85:1}}>{selectMode?<div style={{width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,border:`2px solid ${selected?C.accent:C.border}`,background:selected?C.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700}}>{selected?"✓":""}</div>:<div style={{fontSize:20,lineHeight:1,paddingTop:2}}>{ch.emoji}</div>}<div style={{flex:1,minWidth:0}}><p style={{margin:"0 0 8px",fontSize:14,lineHeight:1.65,color:C.ink,fontFamily:"Phenomena, sans-serif"}}>{note.text}</p><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:11,color:C.subtle,fontFamily:"monospace"}}>{new Date(note.createdAt).toLocaleDateString("fr-FR")}</span><span style={{fontSize:11,color:C.subtle}}>·</span><span style={{fontSize:11,color:note.imported?C.subtle:C.accent,fontWeight:600}}>{note.imported?"📥 Importé":""}</span><span style={{fontSize:11,color:C.subtle}}>·</span><span style={{fontSize:11,color:C.muted}}>{ch.emoji} {ch.label}</span></div></div>{!selectMode&&(<div style={{display:"flex",gap:4,flexShrink:0}}><button onClick={e=>{e.stopPropagation();setEditing(true);setSwiped(false);}} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,padding:4,borderRadius:6,lineHeight:1}}>✏️</button></div>)}</div></div>); }
function AddPeriodModal({open,onClose,onAdd}){ const [label,setLabel]=useState(""); const [start,setStart]=useState(""); const [end,setEnd]=useState(""); function submit(){ if(!label.trim()||!start||!end) return; onAdd({id:`p-${Date.now()}`,label:label.trim(),start,end}); setLabel(""); setStart(""); setEnd(""); onClose(); } return(<Modal open={open} onClose={onClose} title="+ Ajouter une période"><div style={{display:"flex",flexDirection:"column",gap:12}}><div><label style={{fontSize:12,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>Nom de la période</label><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Rapport Juillet…" style={inputStyle} autoFocus/></div><div style={{display:"flex",gap:10}}><div style={{flex:1}}><label style={{fontSize:12,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>Début</label><input type="date" value={start} onChange={e=>setStart(e.target.value)} style={inputStyle}/></div><div style={{flex:1}}><label style={{fontSize:12,color:C.muted,fontWeight:600,display:"block",marginBottom:6}}>Fin</label><input type="date" value={end} onChange={e=>setEnd(e.target.value)} style={inputStyle}/></div></div><div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}><Btn onClick={onClose}>Annuler</Btn><Btn onClick={submit} variant="primary" disabled={!label.trim()||!start||!end}>Ajouter</Btn></div></div></Modal>); }
 
export default function NomadBook({ onClose }){
  const [tab,setTab]=useState("notes");
  const [notes,setNotes]=useState(()=>{const saved=load("nf4_notes",[]); return saved.length===0?IMPORTED_NOTES:saved;});
  const [periods,setPeriods]=useState(()=>load("nb_periods",DEFAULT_PERIODS));
  const [captureOpen,setCaptureOpen]=useState(false);
  const [voiceOpen,setVoiceOpen]=useState(false);
  const [chatOpen,setChatOpen]=useState(false);
  const [addPeriodOpen,setAddPeriodOpen]=useState(false);
  const [selectMode,setSelectMode]=useState(false);
  const [selected,setSelected]=useState(new Set());
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [pendingDeleteId,setPendingDeleteId]=useState(null);
  const [noteText,setNoteText]=useState("");
  const [noteChapter,setNoteChapter]=useState("marche");
  const currentPeriod=getCurrentPeriod(periods);
  const daysToCompile=daysLeft(currentPeriod.end);
  const urg=urgencyStyle(daysToCompile);
  useEffect(()=>save("nf4_notes",notes),[notes]);
  useEffect(()=>save("nb_periods",periods),[periods]);
  useEffect(()=>{ const h=e=>{if(e.ctrlKey&&e.key===" "){e.preventDefault();setCaptureOpen(true);}}; window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h); },[]);
  const voice=useVoice(t=>{setNoteText(t);setVoiceOpen(false);setCaptureOpen(true);});
  function addNote(){ if(!noteText.trim()) return; const note={id:Date.now(),text:noteText.trim(),chapter:noteChapter,createdAt:new Date().toISOString(),period:currentPeriod.id,imported:false}; setNotes(prev=>[note,...prev]); setNoteText(""); setCaptureOpen(false); }
  function editNote(id,{text,chapter}){ setNotes(prev=>prev.map(n=>n.id===id?{...n,text,chapter,editedAt:new Date().toISOString()}:n)); }
  function requestDelete(id){ setPendingDeleteId(id); setConfirmDelete("single"); }
 
  // ── Toutes les notes de la période — sans filtre chapitre ──
  const periodNotes=notes.filter(n=>n.period===currentPeriod.id||n.imported);
  const chapterCounts={};
  periodNotes.forEach(n=>{chapterCounts[n.chapter]=(chapterCounts[n.chapter]||0)+1;});
  const tabs=[{key:"notes",icon:"📝",label:"Notes"},{key:"rapport",icon:"⚡",label:"Rapport"}];
 
  return(
    <div style={{minHeight:"100vh",background:C.bg,color:C.ink,fontFamily:"'Phenomena','Nunito',sans-serif",position:"relative"}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>onClose?onClose():window.location.href="https://cal-flow-jade.vercel.app"}
              style={{background:C.accentLight,border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"5px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:C.accent,display:"flex",alignItems:"center",gap:4}}>
              ← NomadCal
            </button>
            <div>
              <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                <span style={{fontSize:22,fontWeight:800,color:C.accent,letterSpacing:-1,fontFamily:"Phenomena,sans-serif"}}>NomadBook</span>
                <span style={{fontSize:11,color:C.subtle}}>{periodNotes.filter(n=>!n.imported).length} note{periodNotes.filter(n=>!n.imported).length!==1?"s":""} · {currentPeriod.label}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:2}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:urg.color}}/>
                <span style={{fontSize:11,color:urg.color,fontWeight:600}}>Compilation le {fmt(currentPeriod.end)} — {urg.label}</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{setVoiceOpen(true);voice.start();}} style={{width:38,height:38,borderRadius:10,background:C.bg,border:`1.5px solid ${C.border}`,color:voice.listening?C.red:C.muted,fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>🎙</button>
            <button onClick={()=>setCaptureOpen(true)} style={{height:38,padding:"0 16px",borderRadius:10,background:C.accent,border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",boxShadow:`0 2px 12px ${C.accent}55`}}>+ Note</button>
          </div>
        </div>
        <div style={{display:"flex",paddingLeft:20,borderTop:`1px solid ${C.border}`}}>
          {tabs.map(({key,icon,label})=>(<button key={key} onClick={()=>setTab(key)} style={{padding:"10px 14px",border:"none",background:"transparent",cursor:"pointer",fontFamily:"Phenomena,inherit",fontSize:14,fontWeight:tab===key?700:400,color:tab===key?C.accent:C.muted,borderBottom:tab===key?`2px solid ${C.accent}`:"2px solid transparent",transition:"all .15s",display:"flex",alignItems:"center",gap:5}}>{icon} {label}</button>))}
        </div>
      </div>
 
      <div style={{maxWidth:680,margin:"0 auto",padding:"20px 16px 80px"}}>
        {tab==="notes"&&(<div>
          {/* Toolbar sélection uniquement — plus de filtres chapitres */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:6}}>
            <Btn onClick={()=>{setSelectMode(s=>!s);setSelected(new Set());}} variant={selectMode?"soft":"ghost"} style={{fontSize:12,padding:"5px 12px"}}>{selectMode?"✕ Annuler":"☑ Sélectionner"}</Btn>
            {selectMode&&periodNotes.length>0&&(<Btn onClick={()=>setSelected(new Set(periodNotes.map(n=>n.id)))} variant="ghost" style={{fontSize:12,padding:"5px 12px"}}>Tout sélectionner</Btn>)}
            {selectMode&&selected.size>0&&(<Btn onClick={()=>setConfirmDelete("multi")} variant="danger" style={{fontSize:12,padding:"5px 12px"}}>🗑 Supprimer ({selected.size})</Btn>)}
          </div>
          {periodNotes.length===0
            ?<div style={{textAlign:"center",color:C.subtle,padding:"60px 0",fontSize:15}}>Aucune note pour cette période.<br/><span style={{fontSize:13}}>Appuie sur + Note.</span></div>
            :<div style={{display:"flex",flexDirection:"column",gap:8}}>{periodNotes.map(note=>(<NoteCard key={note.id} note={note} onDelete={requestDelete} onEdit={editNote} selectMode={selectMode} selected={selected.has(note.id)} onToggleSelect={()=>{setSelected(prev=>{const next=new Set(prev);next.has(note.id)?next.delete(note.id):next.add(note.id);return next;});}}/>))}</div>}
        </div>)}
 
        {confirmDelete&&(<Modal open={true} onClose={()=>{setConfirmDelete(null);setPendingDeleteId(null);}} title="🗑 Confirmer la suppression"><p style={{fontSize:14,color:C.muted,lineHeight:1.6,marginBottom:20}}>{confirmDelete==="single"?"Supprimer cette note définitivement ?":`Supprimer les ${selected.size} notes sélectionnées définitivement ?`}<br/><span style={{fontSize:12,color:C.subtle}}>Cette action est irréversible.</span></p><div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>{setConfirmDelete(null);setPendingDeleteId(null);}}>Annuler</Btn><Btn variant="danger" onClick={()=>{if(confirmDelete==="single"){setNotes(p=>p.filter(n=>n.id!==pendingDeleteId));}else{setNotes(p=>p.filter(n=>!selected.has(n.id)));setSelected(new Set());setSelectMode(false);}setConfirmDelete(null);setPendingDeleteId(null);}}>Supprimer</Btn></div></Modal>)}
 
        {tab==="rapport"&&(<div>
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div><div style={{fontWeight:800,fontSize:17,color:C.ink,marginBottom:4}}>{currentPeriod.label}</div><div style={{fontSize:13,color:C.muted}}>{fmt(currentPeriod.start)} → {fmt(currentPeriod.end)}</div></div>
              <Pill color={urg.color} bg={urg.bg}>{urg.label}</Pill>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
              {CHAPTERS.filter(c=>chapterCounts[c.id]).map(c=>(<div key={c.id} style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14}}>{c.emoji}</span><span style={{fontSize:13,color:C.muted,flex:1}}>{c.label}</span><div style={{height:6,flex:2,background:C.border,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",background:C.accent,borderRadius:4,width:`${(chapterCounts[c.id]/periodNotes.length)*100}%`,transition:"width .4s"}}/></div><span style={{fontSize:12,color:C.muted,minWidth:20,textAlign:"right"}}>{chapterCounts[c.id]}</span></div>))}
            </div>
            <Btn onClick={()=>setChatOpen(true)} variant="primary" style={{width:"100%",justifyContent:"center",display:"flex"}}>💬 Lancer le brainstorming & générer le rapport</Btn>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,color:C.muted,fontWeight:600,letterSpacing:.5,textTransform:"uppercase"}}>Calendrier des rapports</div>
            <Btn onClick={()=>setAddPeriodOpen(true)} variant="soft" style={{fontSize:12,padding:"5px 12px"}}>+ Période</Btn>
          </div>
          {periods.map(p=>{const days=daysLeft(p.end);const u=urgencyStyle(days);const isCurrent=p.id===currentPeriod.id;return(<div key={p.id} style={{background:isCurrent?C.accentLight:C.surface,border:`1.5px solid ${isCurrent?C.accentBorder:C.border}`,borderRadius:10,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:isCurrent?700:500,fontSize:14,color:isCurrent?C.accent:C.ink}}>{isCurrent?"▶ ":""}{p.label}</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>{fmt(p.start)} → {fmt(p.end)}</div></div><Pill color={u.color} bg={u.bg}>{u.label}</Pill></div>);})}
        </div>)}
      </div>
 
      <Modal open={captureOpen} onClose={()=>setCaptureOpen(false)} title="📝 Nouvelle note">
        <div style={{background:C.accentLight,border:`1px solid ${C.accentBorder}`,borderRadius:8,padding:"8px 12px",marginBottom:16,fontSize:12,color:C.accent,fontWeight:600}}>⚡ Rattachée à : <strong>{currentPeriod.label}</strong> · compilation le {fmt(currentPeriod.end)}</div>
        <div style={{marginBottom:12}}><label style={{fontSize:12,color:C.muted,display:"block",marginBottom:6,fontWeight:600}}>Chapitre</label><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{CHAPTERS.map(c=>(<button key={c.id} onClick={()=>setNoteChapter(c.id)} style={{fontSize:12,fontWeight:600,padding:"6px 12px",borderRadius:20,border:`1.5px solid ${noteChapter===c.id?C.accent:C.border}`,background:noteChapter===c.id?C.accent:C.bg,color:noteChapter===c.id?"#fff":C.muted,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{c.emoji} {c.label}</button>))}</div></div>
        <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={4} placeholder="Ta note terrain…" autoFocus onKeyDown={e=>{if(e.metaKey&&e.key==="Enter")addNote();}} style={{...inputStyle,resize:"vertical",marginBottom:16,lineHeight:1.6}}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}><Btn onClick={()=>setCaptureOpen(false)}>Annuler</Btn><Btn onClick={addNote} variant="primary" disabled={!noteText.trim()}>Enregistrer ⌘↵</Btn></div>
      </Modal>
 
      <Modal open={voiceOpen} onClose={()=>{voice.stop();setVoiceOpen(false);}} title="🎙 Dictée vocale">
        <div style={{textAlign:"center",padding:"12px 0"}}>
          <div style={{width:72,height:72,borderRadius:"50%",margin:"0 auto 16px",background:voice.listening?C.redLight:C.bg,border:`2px solid ${voice.listening?C.red:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,transition:"all .3s"}}>🎙</div>
          <p style={{fontWeight:700,color:voice.listening?C.red:C.muted,marginBottom:12}}>{voice.listening?"Parle maintenant…":"Traitement en cours…"}</p>
          {voice.transcript&&(<div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 16px",textAlign:"left",fontSize:14,lineHeight:1.65,marginBottom:16}}>{voice.transcript}</div>)}
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>{voice.listening?<Btn onClick={voice.stop} variant="danger">⏹ Arrêter</Btn>:voice.transcript&&<><Btn onClick={()=>{voice.discard();setVoiceOpen(false);}}>✕ Annuler</Btn><Btn onClick={voice.confirm} variant="primary">✓ Confirmer</Btn></>}</div>
        </div>
      </Modal>
 
      <Modal open={chatOpen} onClose={()=>setChatOpen(false)} title={`💬 Brainstorming — ${currentPeriod.label}`} wide={true}>
        <AIChat period={currentPeriod} notes={periodNotes}/>
      </Modal>
 
      <AddPeriodModal open={addPeriodOpen} onClose={()=>setAddPeriodOpen(false)} onAdd={p=>setPeriods(prev=>[...prev,p])}/>
 
      <style>{`* { box-sizing: border-box; } @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} } ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#d4c9b8;border-radius:4px} textarea:focus, input:focus { border-color: #2B5A9E !important; } button:active { transform: scale(.97); }`}</style>
    </div>
  );
}
