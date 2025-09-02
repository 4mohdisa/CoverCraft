"use client"

import { useState, useEffect } from "react"
import { InputField } from "@/components/ui/input-field"
import { TextAreaField } from "@/components/ui/textarea-field"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard } from "@/components/ui/custom-card"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Spinner } from "@/components/ui/spinner"
import { 
  FormData, 
  FormErrors, 
  validateForm, 
  buildPayload, 
  callApi, 
  handleCopy,
  persistState,
  hydrateState,
  persistLetter,
  hydrateLetter
} from "@/lib/utils"

const initialFormData: FormData = {
  jobTitle: "",
  companyName: "",
  jobDescription: "",
  extraNotes: ""
}

export default function CoverLetterGenerator() {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [apiError, setApiError] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

  // Hydrate state on mount
  useEffect(() => {
    const savedForm = hydrateState()
    const savedLetter = hydrateLetter()
    
    if (savedForm) {
      setFormData(savedForm)
    }
    if (savedLetter) {
      setGeneratedLetter(savedLetter)
    }
  }, [])

  // Persist form data on changes
  useEffect(() => {
    persistState(formData)
  }, [formData])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
    
    // Clear API error when user makes changes
    if (apiError) {
      setApiError("")
    }
  }

  const handleGenerate = async () => {
    const formErrors = validateForm(formData)
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors)
      return
    }

    setIsLoading(true)
    setApiError("")
    
    try {
      const payload = buildPayload(formData)
      const response = await callApi(payload)
      
      if (response.body) {
        setGeneratedLetter(response.body)
        persistLetter(response.body)
      } else {
        throw new Error("No cover letter generated")
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Failed to generate cover letter")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyToClipboard = async () => {
    const success = await handleCopy(generatedLetter)
    if (success) {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const handleClearForm = () => {
    setFormData(initialFormData)
    setErrors({})
    setGeneratedLetter("")
    setApiError("")
    setCopySuccess(false)
    
    // Clear localStorage
    try {
      localStorage.removeItem('coverLetterForm')
      localStorage.removeItem('lastGeneratedLetter')
    } catch (error) {
      console.warn('Failed to clear localStorage:', error)
    }
  }

  const handleRetry = () => {
    setApiError("")
    handleGenerate()
  }

  const isFormValid = !Object.keys(validateForm(formData)).length
  const wordCount = generatedLetter.split(/\s+/).filter(word => word.length > 0).length
  const charCount = generatedLetter.length

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cover Letter Generator</h1>
          <p className="text-gray-600">Generate tailored cover letters for your job applications</p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <AlertBanner
            variant="error"
            title="Generation Failed"
            onClose={() => setApiError("")}
            action={
              <CustomButton variant="secondary" onClick={handleRetry} className="text-sm">
                Retry
              </CustomButton>
            }
          >
            {apiError}
          </AlertBanner>
        )}

        {/* Copy Success Alert */}
        {copySuccess && (
          <AlertBanner
            variant="success"
            title="Copied to clipboard!"
            onClose={() => setCopySuccess(false)}
          />
        )}

        {/* Form */}
        <CustomCard title="Job Details">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Job Title"
                required
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                error={errors.jobTitle}
                placeholder="e.g. Senior Software Engineer"
              />
              <InputField
                label="Company Name"
                required
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                error={errors.companyName}
                placeholder="e.g. Tech Corp"
              />
            </div>
            

            <TextAreaField
              label="Job Description and Key Requirements"
              required
              value={formData.jobDescription}
              onChange={(e) => handleInputChange('jobDescription', e.target.value)}
              error={errors.jobDescription}
              placeholder="Paste the full job description here..."
              rows={8}
              showCounter
            />

            <TextAreaField
              label="Extra Notes"
              value={formData.extraNotes}
              onChange={(e) => handleInputChange('extraNotes', e.target.value)}
              placeholder="Any additional information or specific points to highlight..."
              rows={3}
              showCounter
            />

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 pt-4">
              <CustomButton
                onClick={handleGenerate}
                disabled={!isFormValid || isLoading}
                loading={isLoading}
                fullWidth
                className="h-12 sm:h-10"
              >
                {isLoading ? "Generating..." : "Generate Letter"}
              </CustomButton>
              <CustomButton
                variant="ghost"
                onClick={handleClearForm}
                disabled={isLoading}
                fullWidth
                className="h-12 sm:h-10"
              >
                Clear Form
              </CustomButton>
            </div>
          </div>
        </CustomCard>

        {/* Output */}
        {generatedLetter && (
          <CustomCard title="Generated Cover Letter">
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={generatedLetter}
                  readOnly
                  className="w-full h-64 sm:h-96 p-4 font-mono text-sm bg-gray-50 border border-gray-200 rounded-md resize-none focus:outline-none"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {wordCount} words • {charCount} characters
                </div>
                <CustomButton
                  variant="secondary"
                  onClick={handleCopyToClipboard}
                >
                  Copy to Clipboard
                </CustomButton>
              </div>
            </div>
          </CustomCard>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}
      </div>
    </div>
  )
}

