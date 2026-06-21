export default function ChevronIcon({ size = 12, color = "#5a6e7f", direction = "up" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ transform: direction === "down" ? "rotate(180deg)" : "none" }}>
      <path d="M5 15l7-7 7 7" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
