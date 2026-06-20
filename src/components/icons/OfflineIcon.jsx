export default function OfflineIcon({ size = 20, color = "#E07B17" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12.5a9 9 0 0114 0M8 16a5 5 0 018 0" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="19.5" r="1.2" fill={color}/>
      <line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
