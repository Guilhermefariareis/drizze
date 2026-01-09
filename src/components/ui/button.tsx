import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft hover:shadow-medium transform hover:scale-105",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft hover:shadow-medium",
        outline:
          "border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground shadow-soft hover:shadow-medium",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft hover:shadow-medium",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-soft hover:shadow-medium transform hover:scale-105",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft hover:shadow-medium transform hover:scale-105",
        gradient: "bg-gradient-primary text-white hover:shadow-glow transform hover:scale-105 font-semibold",
        medical: "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white shadow-medium hover:shadow-large transform hover:scale-105",
        // V2 Variants
        "v2-gradient": "bg-gradient-to-r from-[#E94560] via-[#FB923C] to-[#F9B500] text-white font-bold shadow-lg shadow-[#E94560]/25 hover:scale-105 transition-all",
        "v2-primary": "bg-[#E94560] hover:bg-[#DC2626] text-white font-bold rounded-xl shadow-lg shadow-[#E94560]/25 transition-all",
        "v2-success": "bg-[#4ADE80] hover:bg-[#22C55E] text-white font-bold rounded-xl shadow-lg shadow-[#4ADE80]/25 transition-all",
        "v2-blue": "bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold rounded-xl shadow-lg shadow-[#3B82F6]/25 transition-all",
        "v2-outline": "border border-white/10 text-white/70 font-semibold rounded-xl hover:border-[#E94560]/50 hover:text-[#E94560] transition-all bg-white/[0.03]",
        "v2-ghost": "border border-white/10 text-white/70 font-semibold rounded-xl hover:border-white/30 hover:bg-white/[0.05] transition-all",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-13 rounded-xl px-8 py-4 text-base font-bold",
        xl: "h-16 rounded-2xl px-10 py-5 text-lg font-black",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
