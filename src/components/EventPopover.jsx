import { C } from "../utils/constants.js";
import { deleteEventAction } from "../services/eventActions.js";
import {
  EditIcon,
  DeleteIcon,
  CalendarIcon,
  LocationIcon,
  PendingIcon
} from "./icons";

/**
 * EventPopover – version clean :
 * - taille augmentée
 * - statut uniquement si pending
 * - centré sur point utilisateur
 * - base prête pour arrow
 */

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

  const width = 260;
  const top = position.y - 80;
  const left = Math.max(8, Math.min(position.x - width / 2, window.innerWidth - width - 8));

  return (
    <>
      {/* overlay fermeture */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 299
        }}
      />

      {/* popover */}
      <div
        style={{
          position: "fixed",
          top,
          left,
          zIndex: 300,
          width,
          background: isPending ? "#FFF8ED" : C.surface,
          border: `1.5px solid ${isPending ? "#E07B17" : C.border}`,
          borderRadius: 16,
          boxShadow: "0 10px 28px rgba(0,0,0,.18)",
          padding: "12px 10px"
        }}
      >

        {/* HEADER */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: isPending ? "#B8741A" : C.ink,
            marginBottom: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {isPending && <PendingIcon size={14} />}
          <span>{ev.title}</span>
        </div>

        {/* separator */}
        <div style={{ height: 1, background: C.border, marginBottom: 6 }} />

        {/* INFOS */}
        <div
          style={{
            fontSize: 12,
            color: C.muted,
            marginBottom: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarIcon size={13} />
            <span>
              {ev.startDate} · {ev.startTime} → {ev.endTime}
            </span>
          </div>

          {ev.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LocationIcon size={13} />
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

          {/* COPY (temp texte en attendant vraie icône) */}
          <IconBtn
            onClick={() => {
              onCopy(ev);
              onClose();
            }}
          >
            📋
          </IconBtn>

          {/* EDIT */}
          <IconBtn
            onClick={() => {
              onEdit(ev);
              onClose();
            }}
          >
            <EditIcon />
          </IconBtn>

          {/* DELETE */}
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

        {/* ARROW (base simple, orienté bas) */}
        <div
          style={{
            position: "absolute",
            bottom: -8,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: `8px solid ${isPending ? "#FFF8ED" : C.surface}`
          }}
        />
      </div>
    </>
  );
}


/* bouton icone */
function IconBtn({ children, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px 12px",
        borderRadius: 10,
        color: color || "inherit",
        fontSize: 18
      }}
    >
      {children}
    </button>
  );
}
