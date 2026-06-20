import { useState } from "react";
import { C } from "../utils/constants.js";
import { deleteEventAction } from "../services/eventActions.js";
import {
  CopyIcon,
  EditIcon,
  DeleteIcon,
  CalendarIcon,
  LocationIcon,
  PendingIcon,
  PhoneIcon,
  EmailIcon,
} from "./icons";

const POPOVER_W     = 260;
const POPOVER_H_EST = 150;
const ARROW_SIZE    = 10;
const ARROW_H       = 10;
const MARGIN        = 8;
const SPACE_NEEDED  = POPOVER_H_EST + ARROW_H + MARGIN;

export default function EventPopover({
  ev,
  eventRect,
  onClose,
  onEdit,
  onCopy,
  onDelete
}) {
  const [voletOpen, setVoletOpen] = useState(false);

  if (!ev || !eventRect) return null;

  const isPending = ev.status === "tentative";
  const screenW   = window.innerWidth;
  const screenH   = window.innerHeight;

  // Axe vertical : dessus ou dessous ?
  const spaceAbove = eventRect.top;
  const goAbove    = spaceAbove >= SPACE_NEEDED;

  let top;
  if (goAbove) {
    top = eventRect.top - POPOVER_H_EST - ARROW_H - 4;
  } else {
    top = eventRect.bottom + ARROW_H + 4;
  }
  top = Math.max(MARGIN, Math.min(top, screenH - POPOVER_H_EST - MARGIN));

  // Axe horizontal : centrer sur l'event, clamp dans l'écran
  const eventCX = eventRect.left + eventRect.width / 2;
  const left    = Math.max(
    MARGIN,
    Math.min(eventCX - POPOVER_W / 2, screenW - POPOVER_W - MARGIN)
  );

  // Position de la flèche (offset depuis bord gauche du popover)
  const arrowLeft = Math.max(
    ARROW_SIZE + 4,
    Math.min(eventCX - left - ARROW_SIZE, POPOVER_W - ARROW_SIZE * 2 - 4)
  );

  const bgColor     = isPending ? "#FFF8ED" : C.surface;
  const borderColor = isPending ? "#E07B17" : C.border;

  const arrowBase = {
    position: "absolute",
    width: 0,
    height: 0,
    left: arrowLeft,
    pointerEvents: "none"
  };

  const arrowBorderStyle = goAbove
    ? { ...arrowBase, bottom: -(ARROW_H + 2), borderLeft: `${ARROW_SIZE + 2}px solid transparent`, borderRight: `${ARROW_SIZE + 2}px solid transparent`, borderTop: `${ARROW_H + 2}px solid ${borderColor}`, left: arrowLeft - 2 }
    : { ...arrowBase, top: -(ARROW_H + 2), borderLeft: `${ARROW_SIZE + 2}px solid transparent`, borderRight: `${ARROW_SIZE + 2}px solid transparent`, borderBottom: `${ARROW_H + 2}px solid ${borderColor}`, left: arrowLeft - 2 };

  const arrowFillStyle = goAbove
    ? { ...arrowBase, bottom: -ARROW_H, borderLeft: `${ARROW_SIZE}px solid transparent`, borderRight: `${ARROW_SIZE}px solid transparent`, borderTop: `${ARROW_H}px solid ${bgColor}` }
    : { ...arrowBase, top: -ARROW_H, borderLeft: `${ARROW_SIZE}px solid transparent`, borderRight: `${ARROW_SIZE}px solid transparent`, borderBottom: `${ARROW_H}px solid ${bgColor}` };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 299 }}
      />

      <div
        style={{
          position: "fixed",
          top,
          left,
          zIndex: 300,
          width: POPOVER_W,
          background: bgColor,
          border: `1.5px solid ${borderColor}`,
          borderRadius: 16,
          boxShadow: "0 10px 28px rgba(0,0,0,.18)",
        }}
      >
        <div style={arrowBorderStyle} />
        <div style={arrowFillStyle} />

        <div style={{ position:"relative", padding:"12px 10px", borderRadius:14, overflow:"hidden" }}>
        {/* Volet copie gold */}
        <div style={{
          position: "absolute", inset: 0, background: C.gold, borderRadius: 14, zIndex: 10,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
          clipPath: voletOpen ? "inset(0 0 0% 0 round 14px)" : "inset(0 0 100% 0 round 14px)",
          transition: "clip-path 0.3s cubic-bezier(.4,0,.2,1)",
          pointerEvents: voletOpen ? "auto" : "none",
        }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, opacity: voletOpen ? 1 : 0, transition: "opacity 0.2s 0.22s ease" }}>Événement copié</span>
          <svg style={{ opacity: voletOpen ? 1 : 0, transition: "opacity 0.2s 0.30s ease" }} width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="8" y="8" width="11" height="13" rx="2" stroke="#fff" strokeWidth="1.8"/>
          </svg>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#7a4e0a", textAlign: "center", opacity: voletOpen ? 1 : 0, transition: "opacity 0.2s 0.38s ease" }}>Tap nouveau créneau pour coller</span>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
          color: isPending ? "#B8741A" : C.ink,
          fontSize: 14, fontWeight: 800,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
        }}>
          {isPending && <PendingIcon size={16} />}
          <span>{ev.title}</span>
        </div>

        <div style={{ height: 1, background: C.border, marginBottom: 8 }} />

        <div style={{
          display: "flex", flexDirection: "column", gap: 6,
          marginBottom: 12, fontSize: 12, color: C.muted
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarIcon size={14} />
            <span>{ev.startDate} · {ev.startTime} → {ev.endTime}</span>
          </div>
          {ev.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LocationIcon size={14} />
              <span>{ev.location}</span>
            </div>
          )}
          {ev.tel && (
            <a
              href={`tel:${ev.tel}`}
              style={{ display: "flex", alignItems: "center", gap: 6, color: C.accent, textDecoration: "none", fontSize: 12 }}
            >
              <PhoneIcon size={14} color={C.accent} />
              <span>{ev.tel}</span>
            </a>
          )}
          {ev.email && (
            <a
              href={`mailto:${ev.email}`}
              style={{ display: "flex", alignItems: "center", gap: 6, color: C.accent, textDecoration: "none", fontSize: 12 }}
            >
              <EmailIcon size={14} color={C.accent} />
              <span>{ev.email}</span>
            </a>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <IconBtn onClick={() => {
            if (navigator.vibrate) navigator.vibrate(40);
            setVoletOpen(true);
            onCopy(ev);
            setTimeout(() => {
              setVoletOpen(false);
              setTimeout(() => onClose(), 320);
            }, 1600);
          }}>
            <CopyIcon size={30} />
          </IconBtn>
          <IconBtn onClick={() => { onEdit(ev); onClose(); }}>
            <EditIcon size={30} />
          </IconBtn>
          <IconBtn onClick={() => { onDelete(deleteEventAction(ev)); onClose(); }} color={C.red}>
            <DeleteIcon size={30} />
          </IconBtn>
        </div>
        </div>{/* inner overflow wrapper */}
      </div>
    </>
  );
}

function IconBtn({ children, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: "8px 12px", borderRadius: 10,
        color: color || "inherit",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}
    >
      {children}
    </button>
  );
}
