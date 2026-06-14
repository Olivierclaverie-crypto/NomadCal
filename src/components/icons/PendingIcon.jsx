// PendingIcon — statut « en attente » (ORCHARD)
// Cercle pointillé orange #E07B17 (= provisoire / en cours) + aiguilles or #F5C97A
// Usage : <PendingIcon /> ou <PendingIcon size={20} />
export default function PendingIcon({
  size = 20,
  color = "#E07B17",
  accent = "#F5C97A"
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="En attente"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeDasharray="1.4 2.2"
      />
      <path
        d="M12 8v4.2l2.8 1.7"
        stroke={accent}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
