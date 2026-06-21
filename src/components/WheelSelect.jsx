import { useRef } from "react";
import { C } from "../utils/constants.js";

const ITEM_H = 40;
const VISIBLE_H = 66; // ≈ 33% de l'ancienne fenêtre (200px) — valeur sélectionnée + amorce voisines

const ITEMS = {
  day:   Array.from({length:31}, (_,i) => String(i+1).padStart(2,"0")),
  month: Array.from({length:12}, (_,i) => String(i+1).padStart(2,"0")),
  year:  Array.from({length:10}, (_,i) => String(new Date().getFullYear()-2+i)),
  hh:    Array.from({length:24}, (_,i) => String(i).padStart(2,"0")),
  mm:    Array.from({length:12}, (_,i) => String(i*5).padStart(2,"0")),
};

const FLEX = { day:0.7, month:0.7, year:1.1, hh:0.7, mm:0.7 };

function SingleWheel({ items, selectedIdx, onChange }) {
  const startY = useRef(null);
  const startIdx = useRef(null);
  const clamp = v => Math.max(0, Math.min(items.length - 1, v));
  return (
    <div
      onTouchStart={e => { startY.current = e.touches[0].clientY; startIdx.current = selectedIdx; }}
      onTouchMove={e => {
        e.preventDefault();
        const dy = startY.current - e.touches[0].clientY;
        onChange(clamp(startIdx.current + Math.round(dy / ITEM_H)));
      }}
      style={{ position:"relative", height:VISIBLE_H, overflow:"hidden", cursor:"ns-resize", userSelect:"none", touchAction:"none" }}
    >
      <div style={{ position:"absolute", top:(VISIBLE_H-ITEM_H)/2, left:0, right:0, height:ITEM_H, borderTop:`1.5px solid ${C.border}`, borderBottom:`1.5px solid ${C.border}`, pointerEvents:"none", zIndex:2, background:`${C.accentLight}88` }}/>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:3, background:`linear-gradient(to bottom, ${C.surface} 0%, transparent 6%, transparent 94%, ${C.surface} 100%)` }}/>
      <div style={{ transform:`translateY(${(VISIBLE_H-ITEM_H)/2 - selectedIdx*ITEM_H}px)`, transition:"transform .15s ease-out" }}>
        {items.map((item, i) => (
          <div key={i} onClick={() => onChange(i)} style={{ height:ITEM_H, display:"flex", alignItems:"center", justifyContent:"center", fontSize:i===selectedIdx?18:15, fontWeight:i===selectedIdx?700:400, color:i===selectedIdx?C.ink:C.muted, fontFamily:"Phenomena, sans-serif", cursor:"pointer" }}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WheelSelect({ wheels, value, onChange }) {
  function idxOf(key) {
    const idx = ITEMS[key].indexOf(value[key]);
    return idx >= 0 ? idx : 0;
  }
  function handleChange(key, idx) {
    onChange({ ...value, [key]: ITEMS[key][idx] });
  }
  return (
    <div style={{ display:"flex", gap:4 }}>
      {wheels.map(key => (
        <div key={key} style={{ flex: FLEX[key] || 1 }}>
          <SingleWheel
            items={ITEMS[key]}
            selectedIdx={idxOf(key)}
            onChange={idx => handleChange(key, idx)}
          />
        </div>
      ))}
    </div>
  );
}
