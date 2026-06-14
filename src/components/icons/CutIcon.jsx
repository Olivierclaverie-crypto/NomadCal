// CutIcon — Couper (ORCHARD)
// Ciseaux bleus #2B5A9E, pivot central en or #F5C97A
// Usage : <CutIcon /> ou <CutIcon size={24} />
export default function CutIcon({
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
      aria-label="Couper"
    >
      <circle
        cx="7"
        cy="7"
        r="2.6"
        stroke={color}
        strokeWidth="1.6"
      />
      <circle
        cx="7"
        cy="17"
        r="2.6"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M9.2 8.6 L20 16M9.2 15.4 L20 8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle
        cx="12"
        cy="12"
        r="1.1"
        fill={accent}
      />
    </svg>
  );
}
