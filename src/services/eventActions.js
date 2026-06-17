export function deleteEventAction(ev) {
  return {
    deleted: ev,
    shouldNotify: true,
  };
}
