export default function LocationIcon({ size = 16, color = "#2B5A9E" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10"
        r="2.4"
        stroke={color}
        strokeWidth="1.6"
      />
    </svg>
  );
}
