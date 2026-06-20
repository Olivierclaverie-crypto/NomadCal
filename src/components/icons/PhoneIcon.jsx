export default function PhoneIcon({ size = 20, color = "#2B5A9E", accent = "#F5C97A" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="11" height="18" rx="2.5" stroke={color} strokeWidth="1.6"/>
      <line x1="7.5" y1="18" x2="11.5" y2="18" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M18 8a4 4 0 010 6M20 6a7 7 0 010 10" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
