import { Wrench } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

/**
 * FixMate brand mark. Sizes are fixed here so the logo renders
 * identically on every page — change it in one place only.
 * `light` switches the wordmark to white for dark backgrounds.
 * `onDark` drops the icon tile and whitewashes everything — for
 * dark surfaces like the dashboard sidebar.
 */
export default function Logo({
  className,
  light = false,
  onDark = false,
}: {
  className?: string;
  light?: boolean;
  onDark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="FixMate home"
      className={cn("flex shrink-0 items-center gap-2", className)}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-lg text-white",
          onDark ? "bg-transparent" : "bg-[#1e1b4b]"
        )}
      >
        <Wrench className="size-5" aria-hidden="true" />
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          light || onDark ? "text-white" : "text-gray-900"
        )}
      >
        FixMate
      </span>
    </Link>
  );
}
