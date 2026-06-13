export default function AlertIcon({ size = 16, color = "#5a6e7f" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 20a2 2 0 004 0"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
