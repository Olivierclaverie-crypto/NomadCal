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
        {/* Header */}
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
