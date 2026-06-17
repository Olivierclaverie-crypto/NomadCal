export default function FeedIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 7h8M6 10h5M6 13h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="15" cy="13" r="3" fill="#F5C97A"/>
      <path d="M14 13h2M15 12v2" stroke="#0F1D2B" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
}
