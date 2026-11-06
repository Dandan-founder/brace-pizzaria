"use client";

import * as RadioGroup from "@radix-ui/react-radio-group";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bike, Check, Clock, ExternalLink, Store } from "lucide-react";
import { WhatsAppIcon } from "@/components/brand/SocialIcons";
import { Picture } from "@/components/ui/Picture";
import { QtyControl } from "@/components/ui/QtyControl";
import { Button } from "@/components/ui/Button";
import { useOpenStatus } from "@/components/ui/OpenStatus";
import { extraById } from "@/data/menu";
import { site } from "@/data/site";
import { clearCart, lineImage, lineName, lineTotal, removeWithUndo, subtotal, updateQty, useCart, type Fulfillment } from "@/lib/cart";
import { notifyRemoved } from "@/lib/ui";
import { money } from "@/lib/format";
import { buildOrderMessage, deliveryFee, orderTotal, paymentLabels, whatsappUrl, type OrderDetails, type PaymentMethod } from "@/lib/whatsapp";

type Form = {
  name: string;
  phone: string;
  street: string;
  number: string;
  district: string;
  complement: string;
  reference: string;
  payment: PaymentMethod;
  changeFor: string;
  notes: string;
};

type Errors = Partial<Record<keyof Form, string>>;

const STORAGE_KEY = "brace:checkout:v1";
const empty: Form = { name: "", phone: "", street: "", number: "", district: "", complement: "", reference: "", payment: "pix", changeFor: "", notes: "" };

/** Máscara (11) 91234-5678 */
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function validate(f: Form, fulfillment: Fulfillment): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Escreva seu nome para a gente saber de quem é o pedido.";
  const digits = f.phone.replace(/\D/g, "");
  if (digits.length < 10) e.phone = "Informe um telefone com DDD, por exemplo (11) 91234-5678.";
  if (fulfillment === "delivery") {
    if (f.street.trim().length < 3) e.street = "Informe a rua ou avenida.";
    if (!f.number.trim()) e.number = "Informe o número (ou s/n).";
    if (f.district.trim().length < 2) e.district = "Informe o bairro.";
  }
  return e;
}

/** Link de saída do checkout: vira botão quando o checkout está sobreposto à página (modo página única). */
function ExitLink({ to, onExit, className, onClick, children }: { to: string; onExit?: (hash?: string) => void; className: string; onClick?: () => void; children: React.ReactNode }) {
  if (onExit)
    return (
      <button
        type="button"
        className={`cursor-pointer ${className}`}
        onClick={() => {
          onClick?.();
          onExit(to.split("#")[1]);
        }}
      >
        {children}
      </button>
    );
  return (
    <Link href={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function Checkout({ onExit }: { onExit?: (hash?: string) => void } = {}) {
  const { lines } = useCart();
  const [fulfillment, setFulfillment] = useState<Fulfillment>("delivery");
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const status = useOpenStatus();

  // Lembra os dados do cliente neste navegador (nome, telefone, endereço) para o próximo pedido
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Form> & { fulfillment?: Fulfillment };
        setForm((f) => ({ ...f, ...saved, notes: "", changeFor: "" }));
        if (saved.fulfillment) setFulfillment(saved.fulfillment);
      }
    } catch {
      /* sem armazenamento disponível */
    }
  }, []);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const details: OrderDetails = useMemo(
    () => ({
      name: form.name.trim(),
      phone: form.phone,
      fulfillment,
      address:
        fulfillment === "delivery"
          ? { street: form.street.trim(), number: form.number.trim(), district: form.district.trim(), complement: form.complement.trim(), reference: form.reference.trim() }
          : undefined,
      payment: form.payment,
      changeFor: form.changeFor.trim(),
      notes: form.notes.trim(),
    }),
    [form, fulfillment],
  );

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(form, fulfillment);
    setErrors(e);
    if (Object.keys(e).length) {
      // Leva o foco ao primeiro campo com problema na ordem da página (o erro aparece logo abaixo dele)
      const fields = Array.from(formRef.current?.querySelectorAll<HTMLElement>("[name]") ?? []);
      fields.find((f) => e[f.getAttribute("name") as keyof Form])?.focus();
      return;
    }
    const message = buildOrderMessage(lines, details);
    try {
      const keep = { name: form.name, phone: form.phone, street: form.street, number: form.number, district: form.district, complement: form.complement, reference: form.reference, payment: form.payment };
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...keep, fulfillment }));
    } catch {
      /* ok */
    }
    window.open(whatsappUrl(message), "_blank", "noopener");
    setSent(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!lines.length && !sent) return <EmptyState onExit={onExit} />;

  return (
    <div className="mx-auto max-w-[1400px] px-[var(--gutter)] pb-24 pt-[calc(var(--nav-h)+3rem)] md:pb-36 md:pt-[calc(var(--nav-h)+5rem)]">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <Sent key="sent" message={sent} onExit={onExit} />
        ) : (
          <m.div key="form" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
            <h1 className="display text-[clamp(3rem,8vw,7rem)]">Finalizar pedido</h1>
            {status && !status.open && (
              <p className="mt-6 flex max-w-2xl items-start gap-3 rounded-2xl bg-farinha-2 p-4 text-cenere">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brasa" aria-hidden />
                <span>
                  O forno está apagado agora. Você pode enviar o pedido e a gente responde {status.nextLabel ? `quando abrir, ${status.nextLabel}` : "assim que abrir"}.
                </span>
              </p>
            )}

            <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-12">
              <form ref={formRef} onSubmit={submit} noValidate className="space-y-14 lg:col-span-7" aria-label="Dados do pedido">
                <Step n={1} title="Como você quer receber?">
                  <RadioGroup.Root
                    value={fulfillment}
                    onValueChange={(v) => setFulfillment(v as Fulfillment)}
                    className="grid gap-3 sm:grid-cols-2"
                    aria-label="Entrega ou retirada"
                  >
                    <Option value="delivery" icon={<Bike className="h-6 w-6" aria-hidden />} title="Entrega" detail={`${site.delivery.etaMinutes[0]} a ${site.delivery.etaMinutes[1]} min · taxa ${money(site.delivery.fee)}`} />
                    <Option value="pickup" icon={<Store className="h-6 w-6" aria-hidden />} title="Retirada no balcão" detail={`Pronto em cerca de ${site.delivery.pickupMinutes} min · sem taxa`} />
                  </RadioGroup.Root>

                  <AnimatePresence initial={false} mode="wait">
                    {fulfillment === "delivery" ? (
                      <m.div
                        key="addr"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-5 pt-8 sm:grid-cols-6">
                          <Field className="sm:col-span-4" name="street" label="Rua ou avenida" autoComplete="address-line1" value={form.street} onChange={(v) => set("street", v)} error={errors.street} />
                          <Field className="sm:col-span-2" name="number" label="Número" inputMode="numeric" autoComplete="address-line2" value={form.number} onChange={(v) => set("number", v)} error={errors.number} />
                          <Field className="sm:col-span-3" name="district" label="Bairro" autoComplete="address-level3" value={form.district} onChange={(v) => set("district", v)} error={errors.district} />
                          <Field className="sm:col-span-3" name="complement" label="Complemento" optional autoComplete="off" placeholder="Ex.: apto 42, bloco B…" value={form.complement} onChange={(v) => set("complement", v)} />
                          <Field className="sm:col-span-6" name="reference" label="Ponto de referência" optional autoComplete="off" placeholder="Ex.: em frente à padaria…" value={form.reference} onChange={(v) => set("reference", v)} />
                        </div>
                      </m.div>
                    ) : (
                      <m.p
                        key="pickup"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pt-6 text-cenere"
                      >
                        Retire em {site.address.street}, {site.address.district}. Avisamos pelo WhatsApp quando estiver pronta.
                      </m.p>
                    )}
                  </AnimatePresence>
                </Step>

                <Step n={2} title="Seus dados">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field name="name" label="Nome" autoComplete="name" value={form.name} onChange={(v) => set("name", v)} error={errors.name} />
                    <Field
                      name="phone"
                      label="Telefone com DDD"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      value={form.phone}
                      onChange={(v) => set("phone", maskPhone(v))}
                      error={errors.phone}
                      hint="Para avisarmos sobre o pedido."
                    />
                  </div>
                </Step>

                <Step n={3} title="Pagamento">
                  <p className="-mt-2 mb-5 text-sm text-cenere">Você paga na entrega ou na retirada. Não cobramos nada pelo site.</p>
                  <RadioGroup.Root value={form.payment} onValueChange={(v) => set("payment", v as PaymentMethod)} className="grid gap-3 sm:grid-cols-3" aria-label="Forma de pagamento">
                    {(Object.keys(paymentLabels) as PaymentMethod[]).map((m) => (
                      <Option key={m} value={m} title={{ pix: "Pix", cartao: "Cartão", dinheiro: "Dinheiro" }[m]} detail={{ pix: "QR code na hora", cartao: "Crédito ou débito", dinheiro: "Levamos troco" }[m]} compact />
                    ))}
                  </RadioGroup.Root>
                  <AnimatePresence initial={false}>
                    {form.payment === "dinheiro" && (
                      <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-5 sm:w-1/2">
                          <Field name="changeFor" label="Troco para quanto?" optional autoComplete="off" inputMode="decimal" placeholder="Ex.: R$ 200…" value={form.changeFor} onChange={(v) => set("changeFor", v)} />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </Step>

                <Step n={4} title="Observações">
                  <label htmlFor="notes" className="sr-only">
                    Observações do pedido
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    maxLength={280}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Algo que a gente precisa saber? Interfone, alergias, horário…"
                    autoComplete="off"
                    className="w-full resize-none rounded-2xl border border-forno/20 bg-white/60 px-4 py-3 text-base placeholder:text-cenere-light focus:border-brasa focus:outline-none"
                  />
                </Step>

                {site.isDemo && (
                  <p className="rounded-2xl border border-dashed border-brasa/40 p-4 text-sm text-cenere">
                    Site de demonstração: o pedido abre o WhatsApp com a mensagem pronta, mas o número {site.phoneDisplay} é fictício. Troque em{" "}
                    <code className="rounded bg-farinha-2 px-1.5 py-0.5 text-forno">src/data/site.ts</code>.
                  </p>
                )}

                <div className="lg:hidden">
                  <Summary fulfillment={fulfillment} onExit={onExit} />
                </div>

                <div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <WhatsAppIcon className="h-5 w-5" />
                    Enviar pedido pelo WhatsApp · {money(orderTotal(lines, fulfillment))}
                  </Button>
                  <p className="mt-3 text-sm text-cenere">Abrimos o WhatsApp com seu pedido escrito. É só tocar em enviar.</p>
                </div>
              </form>

              <aside className="hidden lg:col-span-5 lg:block">
                <div className="sticky top-[calc(var(--nav-h)+1.5rem)]">
                  <Summary fulfillment={fulfillment} onExit={onExit} />
                </div>
              </aside>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-6 flex items-baseline gap-4 font-display text-[clamp(1.8rem,3vw,2.4rem)] leading-tight">
        <span className="text-[0.7em] text-olio" aria-hidden>
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Option({ value, title, detail, icon, compact }: { value: string; title: string; detail: string; icon?: React.ReactNode; compact?: boolean }) {
  return (
    <RadioGroup.Item
      value={value}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl border border-forno/15 bg-white/50 text-left transition-[border-color,background-color,box-shadow] duration-200 hover:border-forno/40 data-[state=checked]:border-brasa data-[state=checked]:bg-white data-[state=checked]:shadow-[0_0_0_1px_var(--brasa)] ${compact ? "p-4" : "p-5"}`}
    >
      {icon && <span className="text-brasa">{icon}</span>}
      <span className="flex-1">
        <span className="block font-medium">{title}</span>
        <span className="mt-0.5 block text-sm text-cenere">{detail}</span>
      </span>
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-forno/30 group-data-[state=checked]:border-brasa group-data-[state=checked]:bg-brasa">
        <RadioGroup.Indicator asChild>
          <m.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-farinha">
            <Check className="h-3 w-3" strokeWidth={3.5} aria-hidden />
          </m.span>
        </RadioGroup.Indicator>
      </span>
    </RadioGroup.Item>
  );
}

type FieldProps = {
  name: keyof Form;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "name">;

function Field({ name, label, value, onChange, error, hint, optional, className = "", ...rest }: FieldProps) {
  const id = `f-${name}`;
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[0.95rem] font-medium">
        {label}
        {optional && <span className="font-normal text-cenere"> (opcional)</span>}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        required={!optional}
        className={`h-12 w-full rounded-xl border bg-white/60 px-4 text-base transition-colors placeholder:text-cenere-light focus:outline-none ${
          error ? "border-pomodoro focus:border-pomodoro" : "border-forno/20 focus:border-brasa"
        }`}
        {...rest}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-cenere">
          {hint}
        </p>
      )}
      <AnimatePresence>
        {error && (
          <m.p
            id={`${id}-err`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: [6, -4, 2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-1.5 text-sm text-pomodoro"
          >
            {error}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Summary({ fulfillment, onExit }: { fulfillment: Fulfillment; onExit?: (hash?: string) => void }) {
  const { lines } = useCart();
  const fee = deliveryFee(fulfillment);
  return (
    <section aria-labelledby="resumo" className="rounded-3xl bg-forno p-6 text-farinha md:p-8">
      <h2 id="resumo" className="font-display text-[2rem] leading-none">
        Resumo
      </h2>
      <ul className="mt-6 divide-y divide-farinha/10">
        <AnimatePresence initial={false}>
          {lines.map((l) => (
            <m.li key={l.key} layout exit={{ opacity: 0, height: 0 }} className="flex gap-4 py-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-forno-3">
                {lineImage(l) && <Picture name={lineImage(l)!} alt="" sizes="48px" className="block h-full w-full" imgClassName="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3">
                  <p className="font-medium">{lineName(l)}</p>
                  <p className="tabular-nums">{money(lineTotal(l))}</p>
                </div>
                {l.kind === "product" && (l.extras.length > 0 || l.removed.length > 0 || l.note) && (
                  <p className="mt-0.5 break-words text-sm text-farinha/55">
                    {[...l.extras.map((e) => `+ ${extraById[e].name}`), ...l.removed.map((r) => `sem ${r}`), ...(l.note ? [`“${l.note}”`] : [])].join(" · ")}
                  </p>
                )}
                <div className="mt-2">
                  <QtyControl value={l.qty} onChange={(v) => (v <= 0 ? removeWithUndo(l.key, notifyRemoved) : updateQty(l.key, v))} label={lineName(l)} removable />
                </div>
              </div>
            </m.li>
          ))}
        </AnimatePresence>
      </ul>
      <dl className="mt-4 space-y-2 border-t border-farinha/15 pt-5">
        <div className="flex justify-between text-farinha/70">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{money(subtotal(lines))}</dd>
        </div>
        <div className="flex justify-between text-farinha/70">
          <dt>{fulfillment === "delivery" ? "Taxa de entrega" : "Retirada"}</dt>
          <dd className="tabular-nums">{fee ? money(fee) : "Grátis"}</dd>
        </div>
        <div className="flex items-baseline justify-between pt-2">
          <dt className="text-lg">Total</dt>
          <dd className="font-display text-[2.2rem] tabular-nums">{money(orderTotal(lines, fulfillment))}</dd>
        </div>
      </dl>
      <ExitLink to="/#cardapio" onExit={onExit} className="mt-4 inline-block text-sm text-farinha/70 underline underline-offset-4 hover:text-farinha">
        Adicionar mais itens
      </ExitLink>
    </section>
  );
}

function Sent({ message, onExit }: { message: string; onExit?: (hash?: string) => void }) {
  return (
    <m.div key="sent" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }} className="max-w-3xl" role="status">
      <m.div
        initial={{ scale: 0, rotate: -40 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.15 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-brasa text-farinha"
      >
        <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
      </m.div>
      <h1 className="display mt-8 text-[clamp(2.8rem,7vw,6rem)]">Seu pedido está pronto</h1>
      <p className="mt-6 max-w-[52ch] text-lg text-cenere">
        A mensagem com o pedido já está escrita. Se o WhatsApp não abriu sozinho, toque no botão abaixo e envie a mensagem por lá; a gente responde com o tempo de preparo.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener"
          className="inline-flex h-14 items-center gap-2.5 rounded-full bg-brasa px-7 font-medium text-farinha transition-colors hover:bg-pomodoro"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Abrir o WhatsApp
          <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
        </a>
        <ExitLink
          to="/#inicio"
          onExit={onExit}
          onClick={() => clearCart()}
          className="inline-flex h-14 items-center rounded-full border border-forno/25 px-7 transition-colors hover:border-forno"
        >
          Já enviei, limpar pedido
        </ExitLink>
      </div>
      <details className="mt-12 rounded-2xl bg-farinha-2 p-5">
        <summary className="cursor-pointer font-medium">Ver a mensagem enviada</summary>
        <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-cenere">{message}</pre>
      </details>
    </m.div>
  );
}

function EmptyState({ onExit }: { onExit?: (hash?: string) => void }) {
  return (
    <div className="mx-auto flex min-h-[80svh] max-w-[1400px] flex-col justify-center px-[var(--gutter)] pt-[var(--nav-h)]">
      <h1 className="display max-w-[14ch] text-[clamp(2.8rem,7vw,6rem)]">Seu pedido ainda está vazio</h1>
      <p className="mt-6 max-w-[48ch] text-lg text-cenere">Escolha uma pizza no cardápio e ela aparece aqui para você finalizar.</p>
      <div className="mt-10">
        <ExitLink to="/#cardapio" onExit={onExit} className="inline-flex h-14 items-center rounded-full bg-brasa px-8 font-medium text-farinha transition-colors hover:bg-pomodoro">
          Ver o cardápio
        </ExitLink>
      </div>
    </div>
  );
}
