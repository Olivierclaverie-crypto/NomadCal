export default function DeleteIcon({ size = 16, color = "#c0392b" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5 7h10M8 7V5h4v2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="6"
        y="7"
        width="8"
        height="10"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M9 10v4M11 10v4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
