/**
 * Brasas subindo do fundo do hero. Puro CSS (transform/opacity), posições determinísticas
 * (sem diferença entre servidor e cliente). Desligado com movimento reduzido.
 */
const embers = Array.from({ length: 16 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return {
    left: 30 + r(1) * 70,
    size: 2 + r(2) * 3.5,
    dur: 7 + r(3) * 9,
    delay: -r(4) * 16,
    drift: (r(5) - 0.5) * 120,
    mobile: i % 2 === 0,
  };
});

export function Embers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
      {embers.map((e, i) => (
        <span
          key={i}
          className={`ember absolute bottom-[-12px] rounded-full ${e.mobile ? "" : "max-md:hidden"}`}
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              animationDuration: `${e.dur}s`,
              animationDelay: `${e.delay}s`,
              "--drift": `${e.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
      <style>{`
        .ember{
          background: radial-gradient(circle, #ffd28a 0%, #e0762e 45%, rgba(179,38,30,0) 70%);
          box-shadow: 0 0 6px 1px rgba(224,118,46,.55);
          opacity: 0;
          animation-name: ember-rise;
          animation-timing-function: cubic-bezier(.3,.1,.6,1);
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }
        @keyframes ember-rise{
          0%{transform:translate3d(0,0,0) scale(1);opacity:0}
          10%{opacity:.9}
          70%{opacity:.5}
          100%{transform:translate3d(var(--drift),-92vh,0) scale(.3);opacity:0}
        }
      `}</style>
    </div>
  );
}
