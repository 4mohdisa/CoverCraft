"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "warning" | "info"
  title?: string
  onClose?: () => void
  action?: React.ReactNode
}

const AlertBanner = forwardRef<HTMLDivElement, AlertBannerProps>(
  ({ className, variant = "info", title, children, onClose, action, ...props }, ref) => {
    const variants = {
      error: "bg-red-50 border-red-200 text-red-800",
      success: "bg-green-50 border-green-200 text-green-800", 
      warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
      info: "bg-blue-50 border-blue-200 text-blue-800"
    }

    const iconVariants = {
      error: "text-red-400",
      success: "text-green-400",
      warning: "text-yellow-400", 
      info: "text-blue-400"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md border p-4",
          variants[variant],
          className
        )}
        {...props}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            {variant === "error" && (
              <svg className={cn("h-5 w-5", iconVariants[variant])} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {variant === "success" && (
              <svg className={cn("h-5 w-5", iconVariants[variant])} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className="text-sm font-medium">{title}</h3>
            )}
            {children && (
              <div className={cn("text-sm", title && "mt-2")}>
                {children}
              </div>
            )}
            {action && (
              <div className="mt-3">
                {action}
              </div>
            )}
          </div>
          {onClose && (
            <div className="ml-auto pl-3">
              <button
                onClick={onClose}
                className="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }
)
AlertBanner.displayName = "AlertBanner"

export { AlertBanner }