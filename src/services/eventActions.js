export const EVENT_ACTIONS = {
  COPY: "copy",
  UPDATE: "update",
  DELETE: "delete",
  SET_CONFIRMED: "set_confirmed",
  SET_TENTATIVE: "set_tentative",
};

export function hasSignificantChange(oldEv, newEv) {
  return (
    oldEv.startDate !== newEv.startDate ||
    oldEv.endDate !== newEv.endDate ||
    oldEv.startTime !== newEv.startTime ||
    oldEv.endTime !== newEv.endTime ||
    oldEv.location !== newEv.location
  );
}

export function copyEvent(ev) {
  return { ...ev };
}

export function updateEvent(oldEv, newEv) {
  return {
    updated: newEv,
    shouldNotify: hasSignificantChange(oldEv, newEv),
  };
}

export function deleteEventAction(ev) {
  return {
    deleted: ev,
    shouldNotify: true,
  };
}

export function setConfirmed(ev) {
  return {
    updated: { ...ev, status: "confirmed" },
    shouldNotify: true,
  };
}

export function setTentative(ev) {
  return {
    updated: { ...ev, status: "tentative" },
    shouldNotify: true,
  };
}