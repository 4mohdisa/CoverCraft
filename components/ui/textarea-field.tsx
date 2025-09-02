"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  required?: boolean
  showCounter?: boolean
  maxLength?: number
}

const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ className, label, error, required, showCounter, maxLength, value, ...props }, ref) => {
    const currentLength = typeof value === 'string' ? value.length : 0
    
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          value={value}
          maxLength={maxLength}
          {...props}
        />
        <div className="flex justify-between items-center">
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {showCounter && (
            <p className="text-sm text-gray-500 ml-auto">
              {currentLength}{maxLength && `/${maxLength}`} characters
            </p>
          )}
        </div>
      </div>
    )
  }
)
TextAreaField.displayName = "TextAreaField"

export { TextAreaField }