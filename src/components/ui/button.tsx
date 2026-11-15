import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-40 min-h-11",
  {
    variants: {
      variant: {
        primary: "bg-cyan text-ink hover:bg-paper focus-visible:outline-cyan",
        dark: "bg-ink text-paper hover:bg-coal focus-visible:outline-ink",
        line: "border border-ink bg-paper text-ink hover:bg-mist focus-visible:outline-ink",
        ghost: "border border-mute bg-transparent text-paper hover:bg-graphite focus-visible:outline-paper",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function buttonClass(variant: VariantProps<typeof buttonVariants>["variant"] = "primary") {
  return cn(buttonVariants({ variant }));
}
