import { C } from "../utils/constants.js";
import { deleteEventAction } from "../services/eventActions.js";
import {
  CopyIcon,
  EditIcon,
  DeleteIcon,
  CalendarIcon,
  LocationIcon,
  PendingIcon
} from "./icons";

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
  const top = position.y - 90;
  const left = Math.max(
    8,
    Math.min(position.x - width / 2, window.innerWidth - width - 8)
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 299
        }}
      />

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 8,
            color: isPending ? "#B8741A" : C.ink,
            fontSize: 14,
            fontWeight: 800,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}
        >
          {isPending && <PendingIcon size={16} />}
          <span>{ev.title}</span>
        </div>

        <div
          style={{
            height: 1,
            background: C.border,
            marginBottom: 8
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 12,
            fontSize: 12,
            color: C.muted
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CalendarIcon size={14} />
            <span>
              {ev.startDate} · {ev.startTime} → {ev.endTime}
            </span>
          </div>

          {ev.location && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <LocationIcon size={14} />
              <span>{ev.location}</span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center"
          }}
        >
          <IconBtn
            onClick={() => {
              onCopy(ev);
              onClose();
            }}
          >
            <CopyIcon size={30} />
          </IconBtn>

          <IconBtn
            onClick={() => {
              onEdit(ev);
              onClose();
            }}
          >
            <EditIcon size={30} />
          </IconBtn>

          <IconBtn
            onClick={() => {
              onDelete(deleteEventAction(ev));
              onClose();
            }}
            color={C.red}
          >
            <DeleteIcon size={30} />
          </IconBtn>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: `10px solid ${isPending ? "#FFF8ED" : C.surface}`
          }}
        />
      </div>
    </>
  );
}

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
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {children}
    </button>
  );
}
