import { Wrench } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

/**
 * FixMate brand mark. Sizes are fixed here so the logo renders
 * identically on every page — change it in one place only.
 * `light` switches the wordmark to white for dark backgrounds.
 */
export default function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="FixMate home"
      className={cn("flex shrink-0 items-center gap-2", className)}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-[#1e1b4b] text-white">
        <Wrench className="size-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          light ? "text-white" : "text-gray-900"
        )}
      >
        FixMate
      </span>
    </Link>
  );
}
