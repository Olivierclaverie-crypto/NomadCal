// PasteIcon — Coller (ORCHARD)
// Presse-papier bleu #2B5A9E, pince en or #F5C97A, contenu collé (lignes)
// Usage : <PasteIcon /> ou <PasteIcon size={24} />
export default function PasteIcon({
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
      aria-label="Coller"
    >
      <rect
        x="5"
        y="5"
        width="14"
        height="16"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M9 5a3 3 0 0 1 6 0"
        stroke={accent}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect
        x="9"
        y="3.2"
        width="6"
        height="3.4"
        rx="1.2"
        stroke={accent}
        strokeWidth="1.6"
      />
      <path
        d="M8.5 11h7M8.5 14h7M8.5 17h4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
``
