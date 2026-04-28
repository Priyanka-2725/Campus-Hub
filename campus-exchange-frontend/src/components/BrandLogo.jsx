import { Link } from "react-router-dom";

function CampusMark({ size = 56 }) {
  return (
    <svg
      viewBox="0 0 160 160"
      width={size}
      height={size}
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="8" y="8" width="144" height="144" rx="30" fill="#F6F0DE" />
      <rect x="26" y="60" width="108" height="56" rx="10" fill="#6B8F71" />
      <rect x="34" y="66" width="92" height="40" rx="6" fill="#F6F0DE" />
      <rect x="40" y="76" width="14" height="18" rx="2" fill="#90B15A" />
      <rect x="62" y="70" width="14" height="30" rx="2" fill="#D8A47F" />
      <rect x="84" y="78" width="14" height="22" rx="2" fill="#90B15A" />
      <rect x="106" y="72" width="14" height="28" rx="2" fill="#D8A47F" />
      <path d="M24 112h112" stroke="#6B8F71" strokeWidth="6" strokeLinecap="round" />
      <path
        d="M38 42c18-7 30-11 42-11s24 4 42 11c2 1 3 4 2 6l-2 4c-14 5-27 10-42 10s-28-5-42-10l-2-4c-1-2 0-5 2-6Z"
        fill="#F1A340"
      />
      <path d="M80 44v14" stroke="#F1A340" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M53 49c11 8 20 12 27 12s16-4 27-12"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M59 26l-34 11c-3 1-4 5-2 7l35 13c1 1 4 1 5 0l34-13c2-1 2-5-1-6L61 26c-1-1-2-1-2 0Z" fill="#F29B38" />
      <path d="M59 31l-29 9 30 11 30-11-31-9Z" fill="#F7B455" />
      <path d="M104 72l20 7c6 2 9 8 7 14l-9 24c-2 6-9 9-14 7l-20-7c-6-2-9-9-7-14l9-24c2-6 8-9 14-7Z" fill="#F1A05A" />
      <circle cx="113" cy="74" r="5" fill="#F6F0DE" />
      <path d="M112 80c6 1 10 7 9 13" fill="none" stroke="#F6F0DE" strokeWidth="4" strokeLinecap="round" />
      <path d="M43 124h74" stroke="#6B8F71" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="34" r="1.8" fill="#F6F0DE" />
      <circle cx="80" cy="50" r="2.2" fill="#F6F0DE" />
    </svg>
  );
}

export default function BrandLogo({ to = "/", size = 56, className = "" }) {
  const content = <CampusMark size={size} />;

  const classes = `inline-flex items-center ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} aria-label="Go to home">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}