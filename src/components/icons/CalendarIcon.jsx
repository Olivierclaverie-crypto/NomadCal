export default function CalendarIcon({ size = 16, color = "#2B5A9E" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <rect
        x="2"
        y="4"
        width="16"
        height="14"
        rx="2"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M2 8h16"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M6 2v4M14 2v4"
        stroke="#F5C97A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="5"
        y="11"
        width="3"
        height="3"
        rx=".5"
        fill={color}
        opacity=".6"
      />
      <rect
        x="9"
        y="11"
        width="3"
        height="3"
        rx=".5"
        fill={color}
        opacity=".3"
      />
    </svg>
  );
}
