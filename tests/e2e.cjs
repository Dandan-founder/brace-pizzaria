const { chromium } = require('playwright');
const assert = (c, m) => { if (!c) throw new Error('FALHOU: ' + m); console.log('ok -', m); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  let popupUrl = null;
  await p.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; });
  await p.goto('' + (process.env.BASE_URL || 'http://localhost:4173') + '/', { waitUntil: 'networkidle' });

  // 0. Pausar animações do hero (WCAG 2.2.2)
  await p.waitForTimeout(2500);
  await p.getByRole('button', { name: 'Pausar animações' }).click();
  assert(await p.locator('#inicio[data-paused]').count() === 1, 'botão pausa as animações do hero');
  const r1 = await p.locator('[data-pizza-spin]').evaluate(e => getComputedStyle(e).transform);
  await p.waitForTimeout(1200);
  const r2 = await p.locator('[data-pizza-spin]').evaluate(e => getComputedStyle(e).transform);
  assert(r1 === r2, 'pizza para de girar quando pausada');
  await p.getByRole('button', { name: 'Retomar animações' }).click();

  // 1. Adicionar Margherita pelo cardápio
  await p.locator('#cardapio').scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await p.getByRole('button', { name: 'Adicionar Margherita ao pedido' }).click();
  await p.waitForTimeout(400);
  assert(await p.getByRole('status').filter({ hasText: 'Margherita adicionada' }).isVisible(), 'aviso "adicionada" aparece');
  assert((await p.locator('#cart-button').getAttribute('aria-label')).includes('1 item'), 'contador do carrinho = 1');

  // 2. Personalizar Diavola: + burrata, sem mel, qtd 2
  await p.getByRole('button', { name: 'Personalizar Diavola' }).first().click();
  const dlg = p.getByRole('dialog', { name: 'Diavola' });
  await dlg.waitFor();
  await dlg.getByRole('button', { name: 'Sem mel de pimenta' }).click();
  await dlg.getByLabel('Burrata inteira').check({ force: true });
  await dlg.getByRole('button', { name: 'Aumentar quantidade de Diavola' }).click();
  await p.waitForTimeout(700);
  const btnText = await dlg.getByRole('button', { name: /Adicionar ao pedido/ }).innerText();
  assert(btnText.includes('172,00'), 'preço do personalizador = R$ 172,00 (2 × (68+18)) → ' + btnText.replace(/\n/g,' '));
  await dlg.getByRole('button', { name: /Adicionar ao pedido/ }).click();
  await p.waitForTimeout(600);
  assert((await p.locator('#cart-button').getAttribute('aria-label')).includes('3 itens'), 'contador = 3 itens');

  // 3. Combo
  await p.locator('#ofertas').scrollIntoViewIfNeeded();
  await p.waitForTimeout(600);
  await p.getByRole('button', { name: 'Adicionar combo Notte a due' }).click();
  await p.waitForTimeout(500);

  // 4. Gaveta do carrinho
  await p.locator('#cart-button').click();
  const drawer = p.getByRole('dialog', { name: 'Seu pedido' });
  await drawer.waitFor();
  await p.waitForTimeout(500);
  let sub = await drawer.locator('footer').innerText();
  assert(sub.includes('460,00'), 'subtotal = 59 + 172 + 229 = R$ 460,00');
  assert((await drawer.innerText()).includes('+ Burrata inteira') && (await drawer.innerText()).includes('sem mel de pimenta'), 'personalização aparece na gaveta');
  await drawer.getByRole('button', { name: 'Aumentar quantidade de Margherita' }).click();
  await p.waitForTimeout(400);
  assert((await drawer.locator('footer').innerText()).includes('519,00'), 'quantidade +1 → R$ 519,00');
  await drawer.getByRole('button', { name: 'Diminuir quantidade de Margherita' }).click();
  await drawer.getByRole('button', { name: 'Remover Notte a due' }).click();
  await p.waitForTimeout(600);
  assert((await drawer.locator('footer').innerText()).includes('231,00'), 'remover combo → R$ 231,00');
  assert(await p.getByRole('status').filter({ hasText: 'Removido do pedido: Notte a due' }).isVisible(), 'aviso de remoção com desfazer');
  await p.getByRole('button', { name: 'Desfazer' }).click();
  await p.waitForTimeout(600);
  assert((await drawer.locator('footer').innerText()).includes('460,00'), 'desfazer devolve o combo → R$ 460,00');
  await drawer.getByRole('button', { name: 'Remover Notte a due' }).click();
  await p.waitForTimeout(600);
  const focusInfo = await p.evaluate(() => document.activeElement?.outerHTML.slice(0, 80));
  console.log('   foco após remover:', focusInfo);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(1200);
  assert(!(await drawer.isVisible()), 'Esc fecha a gaveta');

  // 5. Persistência
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  assert((await p.locator('#cart-button').getAttribute('aria-label')).includes('3 itens'), 'carrinho sobrevive ao recarregar');

  // 6. Checkout
  await p.locator('#cart-button').click();
  await p.getByRole('button', { name: 'Finalizar pedido' }).click();
  await p.waitForURL('**/pedido/');
  await p.waitForTimeout(900);
  assert(await p.getByRole('heading', { name: 'Finalizar pedido' }).isVisible(), 'página /pedido abre');
  await p.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ }).click();
  await p.waitForTimeout(500);
  assert(await p.getByText('Escreva seu nome').isVisible(), 'validação: nome obrigatório');
  assert(await p.getByText('Informe a rua ou avenida').isVisible(), 'validação: endereço obrigatório na entrega');
  assert(await p.evaluate(() => document.activeElement?.getAttribute('name')) === 'street', 'foco vai para o primeiro campo com erro');
  const total1 = await p.getByRole('button', { name: /Enviar pedido/ }).innerText();
  assert(total1.includes('240,90'), 'entrega soma taxa: 231 + 9,90 = R$ 240,90');
  await p.getByRole('radio', { name: /Retirada no balcão/ }).click();
  await p.waitForTimeout(500);
  assert((await p.getByRole('button', { name: /Enviar pedido/ }).innerText()).includes('231,00'), 'retirada: sem taxa');
  await p.getByRole('radio', { name: /Entrega/ }).click();
  await p.waitForTimeout(500);
  await p.getByLabel('Rua ou avenida').fill('Rua dos Pinheiros');
  await p.getByLabel('Número').fill('120');
  await p.getByLabel('Bairro').fill('Pinheiros');
  await p.getByLabel('Nome').fill('Ana Teste');
  await p.getByLabel('Telefone com DDD').pressSequentially('11987654321');
  assert(await p.getByLabel('Telefone com DDD').inputValue() === '(11) 98765-4321', 'máscara de telefone');
  await p.getByRole('radio', { name: /Dinheiro/ }).click();
  await p.waitForTimeout(400);
  await p.getByLabel(/Troco para quanto/).fill('R$ 300');
  await p.getByRole('button', { name: /Enviar pedido pelo WhatsApp/ }).click();
  await p.waitForTimeout(900);
  const opened = await p.evaluate(() => window.__opened);
  assert(opened.length === 1 && opened[0].startsWith('https://wa.me/5511900000000?text='), 'abre wa.me com o número configurado');
  const msg = decodeURIComponent(opened[0].split('text=')[1]).replace(/\u00a0/g, ' ');
  console.log('---- mensagem ----\n' + msg + '\n------------------');
  assert(msg.includes('2x *Diavola*') && msg.includes('+ Burrata inteira') && msg.includes('sem mel de pimenta'), 'mensagem tem itens e personalização');
  assert(msg.includes('*Total: R$ 240,90*') && msg.includes('troco para R$ 300'), 'mensagem tem total e troco');
  assert(await p.getByRole('heading', { name: 'Seu pedido está no WhatsApp' }).isVisible(), 'tela de confirmação');
  if (process.argv[2]) await p.screenshot({ path: process.argv[2] + '/e2e-sent.png' });
  console.log(errs.length ? 'ERROS:\n' + JSON.stringify(errs, null, 1) : 'sem erros no console');
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
