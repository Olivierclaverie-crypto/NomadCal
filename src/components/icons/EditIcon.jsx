export default function EditIcon({ size = 16, color = "#2B5A9E" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 7l3.5 3.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
