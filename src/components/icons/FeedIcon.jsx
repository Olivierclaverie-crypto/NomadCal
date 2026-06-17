// ExpenseIcon — Frais (ORCHARD)
// Bloc-notes bleu #2B5A9E + reliure à pastilles or + pièce € (glyphe euro authentique)
// Usage : <ExpenseIcon /> ou <ExpenseIcon size={24} />
export default function ExpenseIcon({ size = 20, color = "#2B5A9E", accent = "#F5C97A", coin = "#fdf8ed", euro = "#7a4e0a" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="Frais">
      {/* papier */}
      <rect x="5" y="6" width="10" height="14" rx="1.5" stroke={color} strokeWidth="1.6"/>
      {/* reliure haute + pastilles */}
      <rect x="6" y="3.4" width="8" height="2.8" rx="1.1" stroke={accent} strokeWidth="1.4"/>
      <circle cx="8" cy="4.8" r="0.45" fill={accent}/>
      <circle cx="10" cy="4.8" r="0.45" fill={accent}/>
      <circle cx="12" cy="4.8" r="0.45" fill={accent}/>
      {/* lignes de texte */}
      <path d="M7.5 10h5M7.5 12.3h5M7.5 14.6h3.2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      {/* pièce € (coin bas-droit) */}
      <circle cx="16.5" cy="16.5" r="4.5" fill={coin} stroke={accent} strokeWidth="1.5"/>
      <path d="M18.2 14.7A2.3 2.3 0 1 0 18.2 18.3M14.9 15.9h2.7M14.9 17.1h2.3" stroke={euro} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
