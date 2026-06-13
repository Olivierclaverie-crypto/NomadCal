export default function AttachmentIcon({ size = 16, color = "#5a6e7f" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M19 11l-7.5 7.5a4 4 0 01-5.7-5.7L13 5.6a2.7 2.7 0 013.8 3.8L9.3 17"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
