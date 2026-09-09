import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  variant?: "horizontal" | "mark";
  size?: "md" | "lg";
};

export function BrandLogo({ className, variant = "horizontal", size = "md" }: BrandLogoProps) {
  if (variant === "mark") {
    return (
      <img
        src={BRAND.icon}
        alt="Scrixo"
        width={32}
        height={32}
        className={cn("h-8 w-8", className)}
      />
    );
  }

  const large = size === "lg";

  return (
    <span className={cn("inline-flex items-center", large ? "gap-3" : "gap-2", className)}>
      <img
        src={BRAND.icon}
        alt="Scrixo"
        width={large ? 56 : 32}
        height={large ? 56 : 32}
        className={large ? "h-12 w-12 sm:h-14 sm:w-14" : "h-7 w-7 md:h-8 md:w-8"}
      />
      <span
        className={cn(
          "font-semibold tracking-tight text-foreground leading-none",
          large ? "text-4xl sm:text-5xl" : "text-xl md:text-[1.35rem]",
        )}
      >
        scrixo
      </span>
    </span>
  );
}
