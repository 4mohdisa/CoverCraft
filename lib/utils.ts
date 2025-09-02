import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Form validation utilities
export interface FormErrors {
  jobTitle?: string
  companyName?: string
  jobDescription?: string
}

export interface FormData {
  jobTitle: string
  companyName: string
  jobDescription: string
  extraNotes: string
}

export function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}

  // Required field validation
  if (!data.jobTitle.trim()) {
    errors.jobTitle = "Job title is required"
  }

  if (!data.companyName.trim()) {
    errors.companyName = "Company name is required"
  }

  if (!data.jobDescription.trim()) {
    errors.jobDescription = "Job description is required"
  }


  return errors
}

export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

export function buildPayload(data: FormData) {
  return {
    jobTitle: sanitizeText(data.jobTitle),
    companyName: sanitizeText(data.companyName),
    jobDescription: sanitizeText(data.jobDescription),
    extraNotes: sanitizeText(data.extraNotes)
  }
}

export async function callApi(payload: ReturnType<typeof buildPayload>) {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  return response.json()
}

export async function handleCopy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

// LocalStorage utilities
const FORM_STORAGE_KEY = 'coverLetterForm'
const LETTER_STORAGE_KEY = 'lastGeneratedLetter'

export function persistState(data: FormData) {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to persist form state:', error)
  }
}

export function hydrateState(): FormData | null {
  try {
    const stored = localStorage.getItem(FORM_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('Failed to hydrate form state:', error)
    return null
  }
}

export function persistLetter(letter: string) {
  try {
    localStorage.setItem(LETTER_STORAGE_KEY, letter)
  } catch (error) {
    console.warn('Failed to persist letter:', error)
  }
}

export function hydrateLetter(): string | null {
  try {
    return localStorage.getItem(LETTER_STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to hydrate letter:', error)
    return null
  }
}