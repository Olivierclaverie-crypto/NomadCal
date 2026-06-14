import { C } from "../utils/constants.js";
import { copyEvent, deleteEventAction } from "../services/eventActions.js";
import { ClockIcon, EditIcon, DeleteIcon, CalendarIcon, LocationIcon, PendingIcon } from "./icons";

export default function EventPopover({
  ev,
  position,
  onClose,
  onEdit,
  onCopy,
  onDelete
}) {
  if (!ev || !position) return null;

  const isPending = ev.status === "tentative";

  return (
    <>
      {/* Overlay fermeture */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 299
        }}
      />

      {/* Popover */}
      <div
        style={{
          position: "fixed",
          top: position.y,
          left: Math.min(Math.max(8, position.x), window.innerWidth - 220),
          zIndex: 300,
          width: 200,
          background: isPending ? "#FFF8ED" : C.surface,
          border: `1.5px solid ${isPending ? "#E07B17" : C.border}`,
          borderRadius: 14,
          boxShadow: "0 6px 24px rgba(0,0,0,.15)",
          padding: "10px 8px"
        }}
      >

        {/* HEADER */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: isPending ? "#B8741A" : C.ink,
            marginBottom: 6,
            padding: "0 6px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {isPending && <PendingIcon size={14} />}
          <span>{ev.title}</span>
        </div>

        {/* Séparateur */}
        <div
          style={{
            height: 1,
            background: C.border,
            marginBottom: 6
          }}
        />

        {/* INFOS */}
        <div
          style={{
            fontSize: 11,
            color: C.muted,
            padding: "0 6px",
            marginBottom: 8,
            display: "flex",
            flexDirection: "column",
            gap: 2
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarIcon size={12} />
            <span>
              {ev.startDate} · {ev.startTime} → {ev.endTime}
            </span>
          </div>

          {ev.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <LocationIcon size={12} />
              <span>{ev.location}</span>
            </div>
          )}
        </div>

        {/* ACTIONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around"
          }}
        >

          <IconBtn
            onClick={() => {
              onCopy(copyEvent(ev));
              onClose();
            }}
          >
            <ClockIcon />
          </IconBtn>

          <IconBtn
            onClick={() => {
              onEdit(ev);
              onClose();
            }}
          >
            <EditIcon />
          </IconBtn>

          <IconBtn
            onClick={() => {
              onDelete(deleteEventAction(ev));
              onClose();
            }}
            color={C.red}
          >
            <DeleteIcon />
          </IconBtn>

        </div>
      </div>
    </>
  );
}

//  Icon button
function IconBtn({ children, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px 10px",
        borderRadius: 8,
        color: color || "inherit"
      }}
    >
      {children}
    </button>
  );
}
