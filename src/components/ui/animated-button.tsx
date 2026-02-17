import * as React from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, asChild = false, variant = "default", size = "default", children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const sizeClasses = {
      default: "h-10 px-5 py-2 text-sm",
      sm: "h-8 px-3 py-1.5 text-xs",
      lg: "h-12 px-8 py-3 text-base",
    };

    return (
      <div className="animated-btn-wrapper relative inline-flex">
        <Comp
          ref={ref}
          className={cn(
            "relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-300",
            "bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(220,60%,35%)] to-[hsl(25,90%,55%)]",
            "text-white shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
            "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            sizeClasses[size],
            className,
          )}
          {...props}
        >
          {children}
        </Comp>
        {/* Border beam - dark mode only */}
        <span className="animated-btn-beam hidden dark:block absolute inset-0 rounded-full overflow-hidden pointer-events-none z-20" aria-hidden="true">
          <span className="beam-light" />
        </span>
      </div>
    );
  },
);
AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
