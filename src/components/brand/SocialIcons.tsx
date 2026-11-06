/** Ícones de marcas desenhados em traço simples (lucide não inclui logos de marcas). */
type P = React.SVGProps<SVGSVGElement>;
const base: P = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false };

export const WhatsAppIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4l-4.5 1.1Z" />
    <path d="M9 8.6c.2-.5.6-.6.9-.6h.4c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.4c0 .3-.1.7-.6.9-.9.4-2 .4-3.7-.6a9 9 0 0 1-3.3-3.3c-1-1.7-1-2.8-.5-3.5Z" />
  </svg>
);

export const InstagramIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r=".6" fill="currentColor" />
  </svg>
);

export const TikTokIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
  </svg>
);

export const FacebookIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M14.5 8H16V4.5h-2.2C11.5 4.5 10 6 10 8.3V10H8v3.4h2V21h3.5v-7.6H16l.5-3.4h-3V8.6c0-.4.3-.6 1-.6Z" />
  </svg>
);

export const socialIcon = (label: string) =>
  ({ Instagram: InstagramIcon, TikTok: TikTokIcon, Facebook: FacebookIcon })[label] ?? InstagramIcon;
