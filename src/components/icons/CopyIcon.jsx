// CopyIcon — Copier (ORCHARD)
// Deux feuilles superposées : feuille source en or #F5C97A, copie en bleu #2B5A9E
// Usage : <CopyIcon /> ou <CopyIcon size={24} />
export default function CopyIcon({
  size = 20,
  color = "#2B5A9E",
  accent = "#F5C97A"
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-label="Copier"
    >
      <rect
        x="8"
        y="8"
        width="11"
        height="13"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
