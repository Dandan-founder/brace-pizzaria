/**
 * Logo Brace: arco do forno a lenha com a brasa acesa + palavra em Bodoni Moda.
 * O arco tem pathLength=1 para a animação de "desenho" na abertura (logo-animation).
 */
export function OvenMark({ className, animated }: { className?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable={false} fill="none">
      <path
        d="M5 33V21a15 15 0 0 1 30 0v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1}
        data-logo-arch={animated ? "" : undefined}
      />
      <path d="M2 33h36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" pathLength={1} data-logo-base={animated ? "" : undefined} />
      <path
        d="M20 30c-4 0-5.5-3-4-6 .8-1.6 2.2-2.4 2.4-4.6 2.9 1.6 5.6 4.6 5.6 7.4 0 2-1.6 3.2-4 3.2Z"
        fill="var(--brasa, #8e1b1b)"
        className="origin-[20px_30px]"
        data-logo-ember={animated ? "" : undefined}
      />
    </svg>
  );
}

export function Logo({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <OvenMark className="h-[1.6em] w-[1.6em] text-olio" animated={animated} />
      <span translate="no" className="font-display text-[1.45em] font-semibold leading-none tracking-[-0.01em]" data-logo-word={animated ? "" : undefined}>
        Brace
      </span>
    </span>
  );
}
