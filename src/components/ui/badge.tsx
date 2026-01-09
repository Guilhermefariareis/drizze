import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // V2 Variants
        "v2-dark": "bg-[#E94560]/20 text-[#E94560] text-xs font-bold rounded-full border border-[#E94560]/30",
        "v2-success": "bg-[#4ADE80]/20 text-[#4ADE80] text-xs font-bold rounded-full border border-[#4ADE80]/30",
        "v2-blue": "bg-[#3B82F6]/20 text-[#3B82F6] text-xs font-bold rounded-full border border-[#3B82F6]/30",
        "v2-orange": "bg-[#FB923C]/20 text-[#FB923C] text-xs font-bold rounded-full border border-[#FB923C]/30",
        "v2-yellow": "bg-[#F9B500]/20 text-[#F9B500] border border-[#F9B500]/50 rounded-full text-xs font-bold animate-pulse",
        "v2-premium": "bg-[#8B5CF6]/20 text-[#8B5CF6] text-xs font-bold rounded-full border border-[#8B5CF6]/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
