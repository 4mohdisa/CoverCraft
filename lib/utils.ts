import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Form validation utilities
export interface FormErrors {
  userName?: string
  jobTitle?: string
  companyName?: string
  jobDescription?: string
  email?: string
}

export type ToneType = 'professional' | 'conversational' | 'enthusiastic' | 'formal'

export interface CoverLetterFormData {
  // User Information
  userName: string
  email: string
  phone: string
  professionalSummary: string
  keySkills: string

  // Job Information
  jobTitle: string
  companyName: string
  jobDescription: string
  extraNotes: string

  // Tone & Style
  tone: ToneType
}

export function validateForm(data: CoverLetterFormData): FormErrors {
  const errors: FormErrors = {}

  // Required field validation
  if (!data.userName.trim()) {
    errors.userName = "Your name is required"
  }

  if (!data.jobTitle.trim()) {
    errors.jobTitle = "Job title is required"
  }

  if (!data.companyName.trim()) {
    errors.companyName = "Company name is required"
  }

  if (!data.jobDescription.trim()) {
    errors.jobDescription = "Job description is required"
  }

  // Optional email validation
  if (data.email.trim() && !isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address"
  }

  return errors
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

export function buildPayload(data: CoverLetterFormData) {
  return {
    userName: sanitizeText(data.userName),
    email: sanitizeText(data.email),
    phone: sanitizeText(data.phone),
    professionalSummary: sanitizeText(data.professionalSummary),
    keySkills: sanitizeText(data.keySkills),
    jobTitle: sanitizeText(data.jobTitle),
    companyName: sanitizeText(data.companyName),
    jobDescription: sanitizeText(data.jobDescription),
    extraNotes: sanitizeText(data.extraNotes),
    tone: data.tone
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

export function persistState(data: CoverLetterFormData) {
  try {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.warn('Failed to persist form state:', error)
  }
}

export function hydrateState(): CoverLetterFormData | null {
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