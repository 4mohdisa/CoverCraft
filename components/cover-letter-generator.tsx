"use client"

import { useState, useEffect } from "react"
import { InputField } from "@/components/ui/input-field"
import { TextAreaField } from "@/components/ui/textarea-field"
import { SelectField } from "@/components/ui/select-field"
import { CustomButton } from "@/components/ui/custom-button"
import { CustomCard } from "@/components/ui/custom-card"
import { AlertBanner } from "@/components/ui/alert-banner"
import { Spinner } from "@/components/ui/spinner"
import { FileUpload } from "@/components/ui/file-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CoverLetterFormData,
  FormErrors,
  ToneType,
  validateForm,
  buildPayload,
  callApi,
  handleCopy,
  persistState,
  hydrateState,
  persistLetter,
  hydrateLetter
} from "@/lib/utils"

const initialFormData: CoverLetterFormData = {
  // User Information
  userName: "",
  email: "",
  phone: "",
  professionalSummary: "",
  keySkills: "",

  // Job Information
  jobTitle: "",
  companyName: "",
  jobDescription: "",
  extraNotes: "",

  // Tone & Style
  tone: "conversational"
}

const toneOptions = [
  {
    value: 'conversational',
    label: 'Conversational',
    description: 'Casual, friendly, and authentic tone'
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Balanced and business-appropriate'
  },
  {
    value: 'enthusiastic',
    label: 'Enthusiastic',
    description: 'Energetic and passionate tone'
  },
  {
    value: 'formal',
    label: 'Formal',
    description: 'Traditional and highly professional'
  }
]

export default function CoverLetterGenerator() {
  const [formData, setFormData] = useState<CoverLetterFormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [apiError, setApiError] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)

  // Resume upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isParsingResume, setIsParsingResume] = useState(false)
  const [resumeError, setResumeError] = useState("")
  const [inputMethod, setInputMethod] = useState<'manual' | 'upload'>('manual')

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

  const handleInputChange = (field: keyof CoverLetterFormData, value: string) => {
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

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setResumeError("")
    setIsParsingResume(true)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to parse resume')
      }

      const parsedData = await response.json()

      // Auto-fill form fields with parsed data
      setFormData(prev => ({
        ...prev,
        userName: parsedData.userName || prev.userName,
        email: parsedData.email || prev.email,
        phone: parsedData.phone || prev.phone,
        professionalSummary: parsedData.professionalSummary || prev.professionalSummary,
        keySkills: parsedData.keySkills || prev.keySkills,
      }))

      // Clear any existing errors for auto-filled fields
      setErrors({})

    } catch (error) {
      setResumeError(error instanceof Error ? error.message : 'Failed to parse resume')
      setSelectedFile(null)
    } finally {
      setIsParsingResume(false)
    }
  }

  const handleFileClear = () => {
    setSelectedFile(null)
    setResumeError("")
  }

  const isFormValid = !Object.keys(validateForm(formData)).length
  const wordCount = generatedLetter.split(/\s+/).filter(word => word.length > 0).length
  const charCount = generatedLetter.length

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Cover Letter Generator</h1>
          <p className="text-gray-600">Create personalized, professional cover letters tailored to any job application</p>
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

        {/* User Information Form */}
        <CustomCard
          title="Your Information"
          description="Tell us about yourself so we can personalize your cover letter"
        >
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Upload Resume</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  required
                  value={formData.userName}
                  onChange={(e) => handleInputChange('userName', e.target.value)}
                  error={errors.userName}
                  placeholder="e.g. John Doe"
                />
                <InputField
                  label="Email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="e.g. john@example.com"
                />
              </div>

              <InputField
                label="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="e.g. +1 (555) 123-4567"
              />

              <TextAreaField
                label="Professional Summary"
                value={formData.professionalSummary}
                onChange={(e) => handleInputChange('professionalSummary', e.target.value)}
                placeholder="Brief summary of your experience and background (e.g., '5 years of full-stack development experience with React and Node.js...')"
                rows={3}
                showCounter
              />

              <TextAreaField
                label="Key Skills"
                value={formData.keySkills}
                onChange={(e) => handleInputChange('keySkills', e.target.value)}
                placeholder="List your relevant skills separated by commas (e.g., 'JavaScript, React, Node.js, Python, AWS...')"
                rows={2}
                showCounter
              />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Upload your resume and we&apos;ll automatically extract your information. You can edit the details after uploading.
                  </p>
                </div>

                <FileUpload
                  onFileSelect={handleFileSelect}
                  onClear={handleFileClear}
                  accept=".pdf,.docx,.txt"
                  maxSize={5}
                  disabled={isParsingResume}
                  error={resumeError}
                  selectedFile={selectedFile}
                />

                {isParsingResume && (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" />
                    <span className="ml-3 text-sm text-gray-600">
                      Parsing your resume...
                    </span>
                  </div>
                )}

                {selectedFile && !isParsingResume && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      Extracted Information (you can edit below):
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Full Name"
                        required
                        value={formData.userName}
                        onChange={(e) => handleInputChange('userName', e.target.value)}
                        error={errors.userName}
                        placeholder="e.g. John Doe"
                      />
                      <InputField
                        label="Email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        error={errors.email}
                        placeholder="e.g. john@example.com"
                      />
                    </div>

                    <InputField
                      label="Phone Number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="e.g. +1 (555) 123-4567"
                    />

                    <TextAreaField
                      label="Professional Summary"
                      value={formData.professionalSummary}
                      onChange={(e) => handleInputChange('professionalSummary', e.target.value)}
                      placeholder="Brief summary of your experience and background"
                      rows={3}
                      showCounter
                    />

                    <TextAreaField
                      label="Key Skills"
                      value={formData.keySkills}
                      onChange={(e) => handleInputChange('keySkills', e.target.value)}
                      placeholder="List your relevant skills separated by commas"
                      rows={2}
                      showCounter
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CustomCard>

        {/* Job Information Form */}
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

            <SelectField
              label="Writing Tone"
              required
              value={formData.tone}
              onValueChange={(value) => handleInputChange('tone', value as ToneType)}
              options={toneOptions}
              placeholder="Select a writing tone..."
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

