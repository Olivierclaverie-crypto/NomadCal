export default function LinkIcon({ size = 16, color = "#5a6e7f" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <rect
        x="3"
        y="6"
        width="13"
        height="12"
        rx="2"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M16 10l5-3v10l-5-3z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
