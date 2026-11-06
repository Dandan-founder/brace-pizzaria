import Link from "next/link";
import { forwardRef } from "react";

type Variant = "primary" | "outline" | "outline-dark" | "gold" | "ghost";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-brasa text-farinha hover:bg-pomodoro shadow-[0_10px_30px_-12px_rgba(142,27,27,.8)] hover:shadow-[0_14px_36px_-12px_rgba(179,38,30,.9)]",
  outline: "border border-farinha/35 text-farinha hover:border-farinha hover:bg-farinha/5",
  "outline-dark": "border border-forno/30 text-forno hover:border-forno hover:bg-forno/5",
  gold: "bg-olio text-forno hover:bg-olio-light",
  ghost: "text-current hover:bg-current/10",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

export const buttonClass = (variant: Variant = "primary", size: Size = "md", extra = "") =>
  [
    "relative inline-flex select-none items-center justify-center gap-2 rounded-full font-medium tracking-[0.01em]",
    "transition-[background-color,border-color,box-shadow,transform,color] duration-200 ease-[var(--ease-ui)]",
    // Squash leve ao pressionar (web-motion-design: squash & stretch)
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 cursor-pointer",
    variants[variant],
    sizes[size],
    extra,
  ].join(" ");

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...rest} />;
});

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant; size?: Size };

export function ButtonLink({ variant = "primary", size = "md", className = "", href, ...rest }: LinkProps) {
  const cls = buttonClass(variant, size, className);
  if (href.startsWith("http") || href.startsWith("#")) return <a href={href} className={cls} {...rest} />;
  return <Link href={href} className={cls} {...rest} />;
}
