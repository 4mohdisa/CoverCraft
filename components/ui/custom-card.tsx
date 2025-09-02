"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface CustomCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

const CustomCard = forwardRef<HTMLDivElement, CustomCardProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border border-gray-200 bg-white shadow-sm",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="p-6 pb-4">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        )}
        <div className={cn("p-6", (title || description) && "pt-0")}>
          {children}
        </div>
      </div>
    )
  }
)
CustomCard.displayName = "CustomCard"

export { CustomCard }