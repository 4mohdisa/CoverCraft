"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  loading?: boolean
  fullWidth?: boolean
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = "primary", loading, fullWidth, children, disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      primary: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 h-10 px-4 py-2",
      secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-900 h-10 px-4 py-2",
      ghost: "text-gray-900 hover:bg-gray-100 focus:ring-gray-900 h-10 px-4 py-2"
    }
    
    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
CustomButton.displayName = "CustomButton"

export { CustomButton }