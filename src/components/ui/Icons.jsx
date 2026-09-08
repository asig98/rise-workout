/* Inline SVG icons. Inline rather than an icon font so they inherit
   currentColor and can't flash unstyled on a slow connection. */

export const GripIcon = () => (
  <svg viewBox="0 0 24 24">
    <circle cx="9" cy="6" r="1.7" /><circle cx="15" cy="6" r="1.7" />
    <circle cx="9" cy="12" r="1.7" /><circle cx="15" cy="12" r="1.7" />
    <circle cx="9" cy="18" r="1.7" /><circle cx="15" cy="18" r="1.7" />
  </svg>
);

export const PencilIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="M14.5 6.5l3 3" />
  </svg>
);

export const TrashIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 7h16" />
    <path d="M10 4h4a1 1 0 0 1 1 1v2H9V5a1 1 0 0 1 1-1z" />
    <path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7" />
    <path d="M10.5 11v6M13.5 11v6" />
  </svg>
);

export const CheckIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6.5" /></svg>
);

export const TodayIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M4 12.5 9 17.5 20 6.5" /></svg>
);

export const ChartIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
);

export const ListIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h9" /></svg>
);
