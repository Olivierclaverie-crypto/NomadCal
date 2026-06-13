export default function HomeIcon({ size = 16, color = "#2B5A9E" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4 11l8-6 8 6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6 10v8h12v-8"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 18v-5h4v5"
        stroke="#F5C97A"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
