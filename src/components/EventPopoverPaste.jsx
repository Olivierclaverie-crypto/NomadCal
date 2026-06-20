import { useState, useEffect } from "react";
import { C } from "../utils/constants.js";
import { timeToMinutes, minutesToHHMM } from "../utils/helpers.js";
import { CancelIcon, ConfirmIcon, PasteIcon } from "./icons";
import WheelSelect from "./WheelSelect.jsx";

const POPOVER_W     = 260;
const POPOVER_H_EST = 560;
const ARROW_SIZE    = 10;
const ARROW_H       = 10;
const MARGIN        = 8;
const SPACE_NEEDED  = POPOVER_H_EST + ARROW_H + MARGIN;
const STEP_MIN      = 30;

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });
}

function fmtDuration(startTime, endTime) {
  const mins = timeToMinutes(endTime || "10:00") - timeToMinutes(startTime || "09:00");
  if (mins <= 0) return "";
  if (mins < 60) return mins + " min";
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h} h`;
}

export default function EventPopoverPaste({
  clipboard,
  eventRect,
  targetDate,
  targetTime,
  onConfirm,
  onCancel,
  onGhostChange,
  calendars = [],
}) {
  if (!clipboard || !eventRect) return null;

  const origDuration = Math.max(
    30,
    timeToMinutes(clipboard.endTime || "10:00") - timeToMinutes(clipboard.startTime || "09:00")
  );

  const [startDate, setSD]        = useState(targetDate);
  const [endDate,   setED]        = useState(targetDate);
  const [startTime, setStartTime] = useState(targetTime);
  const [endTime,   setEndTime]   = useState(minutesToHHMM(Math.min(1440, timeToMinutes(targetTime) + origDuration)));
  const [calHref,   setCalHref]   = useState(clipboard.calHref || (calendars[0]?.href ?? ""));
  const [voletOpen, setVoletOpen] = useState(false);

  // Met à jour le bloc fantôme en temps réel
  useEffect(() => {
    onGhostChange && onGhostChange({ date: startDate, time: startTime, endTime });
    return () => { onGhostChange && onGhostChange(null); };
  }, [startDate, startTime, endTime]);

  function roundMm(t) {
    const mm = parseInt((t||"00:00").split(':')[1] || 0);
    return String(Math.min(55, Math.round(mm / 5) * 5)).padStart(2, '0');
  }

  function wheelVal5(isoDate, isoTime) {
    const [yr, mo, dd] = (isoDate || targetDate).split('-');
    const hh = (isoTime || "00:00").split(':')[0];
    return { day: dd, month: mo, year: yr, hh, mm: roundMm(isoTime) };
  }

  function handleStartChange(v) {
    const d = `${v.year}-${v.month}-${v.day}`;
    const t = `${v.hh}:${v.mm}`;
    const dur = Math.max(STEP_MIN, timeToMinutes(endTime) - timeToMinutes(startTime));
    setSD(d); setED(d);
    setStartTime(t);
    setEndTime(minutesToHHMM(Math.min(1440, timeToMinutes(t) + dur)));
  }

  function handleEndChange(v) {
    const d = `${v.year}-${v.month}-${v.day}`;
    const t = `${v.hh}:${v.mm}`;
    const sMin = timeToMinutes(startTime);
    setED(d);
    setEndTime(timeToMinutes(t) <= sMin ? minutesToHHMM(Math.min(1440, sMin + STEP_MIN)) : t);
  }

  function handleCancel() {
    setVoletOpen(true);
    setTimeout(() => {
      setVoletOpen(false);
      setTimeout(() => onCancel(), 320);
    }, 1400);
  }

  function handleConfirm() {
    onGhostChange && onGhostChange(null);
    onConfirm({ startDate, startTime, endDate, endTime, calHref });
  }

  // Positionnement smart
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const goAbove = eventRect.top >= SPACE_NEEDED;

  let top = goAbove
    ? eventRect.top - POPOVER_H_EST - ARROW_H - 4
    : eventRect.bottom + ARROW_H + 4;
  top = Math.max(MARGIN, Math.min(top, screenH - POPOVER_H_EST - MARGIN));

  const eventCX = eventRect.left + eventRect.width / 2;
  const left = Math.max(MARGIN, Math.min(eventCX - POPOVER_W / 2, screenW - POPOVER_W - MARGIN));

  const arrowLeft = Math.max(
    ARROW_SIZE + 4,
    Math.min(eventCX - left - ARROW_SIZE, POPOVER_W - ARROW_SIZE * 2 - 4)
  );

  const arrowBase = { position: "absolute", width: 0, height: 0, left: arrowLeft, pointerEvents: "none" };
  const arrowBorderStyle = goAbove
    ? { ...arrowBase, bottom: -(ARROW_H + 2), borderLeft: `${ARROW_SIZE + 2}px solid transparent`, borderRight: `${ARROW_SIZE + 2}px solid transparent`, borderTop: `${ARROW_H + 2}px solid ${C.border}`, left: arrowLeft - 2 }
    : { ...arrowBase, top: -(ARROW_H + 2), borderLeft: `${ARROW_SIZE + 2}px solid transparent`, borderRight: `${ARROW_SIZE + 2}px solid transparent`, borderBottom: `${ARROW_H + 2}px solid ${C.border}`, left: arrowLeft - 2 };
  const arrowFillStyle = goAbove
    ? { ...arrowBase, bottom: -ARROW_H, borderLeft: `${ARROW_SIZE}px solid transparent`, borderRight: `${ARROW_SIZE}px solid transparent`, borderTop: `${ARROW_H}px solid ${C.surface}` }
    : { ...arrowBase, top: -ARROW_H, borderLeft: `${ARROW_SIZE}px solid transparent`, borderRight: `${ARROW_SIZE}px solid transparent`, borderBottom: `${ARROW_H}px solid ${C.surface}` };

  const lbl = { fontSize: 9, color: C.muted, fontWeight: 700, width: 36, flexShrink: 0, textTransform: "uppercase", letterSpacing: 0.3 };
  const val = { flex: 1, fontSize: 12, fontWeight: 700, color: C.accent, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 9px" };

  const selectedCal = calendars.find(c => c.href === calHref);

  return (
    <>
      <div onClick={() => handleCancel()} style={{ position: "fixed", inset: 0, zIndex: 399 }} />

      <div style={{
        position: "fixed", top, left, zIndex: 400, width: POPOVER_W,
        background: C.surface, border: `1.5px solid ${C.border}`,
        borderRadius: 16, boxShadow: "0 10px 28px rgba(0,0,0,.18)",
        overflow: "hidden",
      }}>
        <div style={arrowBorderStyle} />
        <div style={arrowFillStyle} />

        {/* Volet annulation gold */}
        <div style={{
          position: "absolute", inset: 0, background: C.gold, borderRadius: 14, zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
          clipPath: voletOpen ? "inset(0 0 0% 0 round 14px)" : "inset(0 0 100% 0 round 14px)",
          transition: "clip-path 0.3s cubic-bezier(.4,0,.2,1)",
          pointerEvents: voletOpen ? "auto" : "none",
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, opacity: voletOpen ? 1 : 0, transition: "opacity 0.2s 0.22s ease" }}>
            Annulation
          </span>
          <div style={{ opacity: voletOpen ? 1 : 0, transition: "opacity 0.2s 0.30s ease" }}>
            <PasteIcon size={28} color={C.ink} />
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#7a4e0a", textAlign: "center", opacity: voletOpen ? 1 : 0, transition: "opacity 0.2s 0.38s ease", padding: "0 12px" }}>
            Événement toujours dans le presse-papier
          </span>
        </div>

        {/* En-tête rappel */}
        <div style={{ background: "#2B5A9E0F", padding: "8px 12px", display: "flex", alignItems: "center", gap: 7, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>À coller</div>
            <div style={{ fontSize: 11, color: C.accent, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{clipboard.title}</div>
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, background: C.gold, color: C.ink, padding: "2px 6px", borderRadius: 5, flexShrink: 0 }}>
            {fmtDuration(startTime, endTime)}
          </div>
        </div>

        {/* Champs */}
        <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Début — 5 roues */}
          <div>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>Début</div>
            <WheelSelect wheels={['day','month','year','hh','mm']} value={wheelVal5(startDate, startTime)} onChange={handleStartChange} />
          </div>

          {/* Fin — 5 roues */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>Fin</div>
            <WheelSelect wheels={['day','month','year','hh','mm']} value={wheelVal5(endDate, endTime)} onChange={handleEndChange} />
          </div>

          {/* Calendrier — select si plusieurs */}
          {calendars.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={lbl}>Cal.</span>
              {calendars.length === 1 ? (
                <div style={{ ...val, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: calendars[0].color || C.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{calendars[0].displayName}</span>
                </div>
              ) : (
                <div style={{ flex: 1, position: "relative" }}>
                  <div style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 8, height: 8, borderRadius: "50%", background: selectedCal?.color || C.accent, pointerEvents: "none", zIndex: 1 }} />
                  <select
                    value={calHref}
                    onChange={e => setCalHref(e.target.value)}
                    style={{
                      width: "100%", fontSize: 11, fontWeight: 700, color: C.accent,
                      background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8,
                      padding: "5px 9px 5px 22px", cursor: "pointer",
                      fontFamily: "inherit", appearance: "none", WebkitAppearance: "none",
                    }}
                  >
                    {calendars.map(c => (
                      <option key={c.href} value={c.href}>{c.displayName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${C.border}`, padding: "8px 14px" }}>
          <button onClick={handleCancel} style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", padding:0, background:"#fbeae8" }}>
            <CancelIcon size={16} color={C.red} />
          </button>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{fmtDuration(startTime, endTime)}</span>
          <button onClick={handleConfirm} style={{ width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer", padding:0, background:"#e8f3ec" }}>
            <ConfirmIcon size={18} color={C.green} />
          </button>
        </div>
      </div>
    </>
  );
}
