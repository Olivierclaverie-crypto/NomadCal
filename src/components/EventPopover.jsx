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
          padding: "12px 10px"
        }}
      >
        <div style={arrowBorderStyle} />
        <div style={arrowFillStyle} />

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
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: C.accent,
                textDecoration: "none",
                fontSize: 12,
              }}
            >
              <PhoneIcon size={14} color={C.accent} />
              <span>{ev.tel}</span>
            </a>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
          <IconBtn onClick={() => { onCopy(ev); onClose(); }}>
            <CopyIcon size={30} />
          </IconBtn>
          <IconBtn onClick={() => { onEdit(ev); onClose(); }}>
            <EditIcon size={30} />
          </IconBtn>
          <IconBtn onClick={() => { onDelete(deleteEventAction(ev)); onClose(); }} color={C.red}>
            <DeleteIcon size={30} />
          </IconBtn>
        </div>
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
