import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-brand-500 text-white hover:bg-brand-600",
                secondary: "bg-secondary-light text-white border border-white/10 hover:bg-white/10",
                success: "bg-green-500 text-white hover:bg-green-600",
                warning: "bg-yellow-500 text-black hover:bg-yellow-600",
                danger: "bg-red-500 text-white hover:bg-red-600",
                outline: "border border-brand-500 text-brand-400 hover:bg-brand-500/10",
                ghost: "text-white/70 hover:bg-white/10",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

export function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}
