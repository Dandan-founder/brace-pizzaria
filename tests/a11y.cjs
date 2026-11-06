const { chromium } = require('playwright');
const fs = require('fs');
const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.BASE_URL || 'http://localhost:4173';
(async () => {
  const b = await chromium.launch();
  // 1) Movimento reduzido: tudo precisa estar visível sem animação
  const rm = await b.newPage({ viewport: { width: 1280, height: 860 }, reducedMotion: 'reduce' });
  await rm.goto(BASE + '/', { waitUntil: 'networkidle' });
  await rm.waitForTimeout(800);
  const hidden = await rm.evaluate(() => [...document.querySelectorAll('[data-reveal],[data-hero-hide],[data-split]')].filter(e => { const s = getComputedStyle(e); return s.opacity === '0' || s.visibility === 'hidden' || (s.clipPath && s.clipPath.startsWith('inset(100%')); }).length);
  console.log('movimento reduzido: elementos escondidos =', hidden, '| html.motion-ok =', await rm.evaluate(() => document.documentElement.classList.contains('motion-ok')));
    // 2) axe nas duas páginas, desktop e celular
  for (const [w, h] of [[1280, 860], [390, 844]]) {
    for (const path of ['/', '/pedido/']) {
      const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
      await p.goto(BASE + '/', { waitUntil: 'networkidle' });
      await p.evaluate(() => localStorage.setItem('brace:cart:v1', JSON.stringify({ lines: [{ key: 'p|margherita|||', kind: 'product', productId: 'margherita', qty: 1, extras: [], removed: [], note: '' }] })));
      await p.goto(BASE + path, { waitUntil: 'networkidle' });
      await p.waitForTimeout(600);
      await p.addScriptTag({ content: axe });
      const r = await p.evaluate(async () => {
        const res = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { 'frame-tested': { enabled: false } } });
        return res.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 3).map(n => n.target.join(' ') + ' :: ' + (n.failureSummary || '').split('\n')[1]) }));
      });
      console.log(`\n== axe ${path} @${w}px: ${r.length} violações`);
      r.forEach(v => console.log(` [${v.impact}] ${v.id} (${v.n}): ${v.help}\n   ${v.sample.join('\n   ')}`));
      await p.close();
    }
  }
  await b.close();
})();
