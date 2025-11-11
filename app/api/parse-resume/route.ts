import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import mammoth from 'mammoth'

interface ParsedResumeData {
  userName: string
  email: string
  phone: string
  professionalSummary: string
  keySkills: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOCX, or TXT file.' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Extract text from file based on type
    let parsedData: ParsedResumeData
    const buffer = await file.arrayBuffer()

    if (file.type === 'application/pdf') {
      // For PDFs, use OpenAI Vision API directly
      const base64 = Buffer.from(buffer).toString('base64')
      parsedData = await parseResumeWithAIVision(base64, 'pdf')
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Parse DOCX
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) })
      const resumeText = result.value

      if (!resumeText || resumeText.trim().length < 50) {
        return NextResponse.json(
          { error: 'Could not extract meaningful text from the resume' },
          { status: 400 }
        )
      }

      parsedData = await parseResumeWithAI(resumeText)
    } else {
      // Plain text
      const resumeText = await file.text()

      if (!resumeText || resumeText.trim().length < 50) {
        return NextResponse.json(
          { error: 'Could not extract meaningful text from the resume' },
          { status: 400 }
        )
      }

      parsedData = await parseResumeWithAI(resumeText)
    }

    return NextResponse.json(parsedData)

  } catch (error) {
    console.error('Resume parsing error:', error)
    return NextResponse.json(
      { error: 'Failed to parse resume. Please try again or fill in manually.' },
      { status: 500 }
    )
  }
}

async function parseResumeWithAIVision(base64Data: string, fileType: string): Promise<ParsedResumeData> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const prompt = `You are a resume parser. Extract the following information from this resume PDF and return it as JSON.

Extract and return ONLY a JSON object with these exact fields:
{
  "userName": "Full name of the person",
  "email": "Email address (empty string if not found)",
  "phone": "Phone number (empty string if not found)",
  "professionalSummary": "A 2-3 sentence summary of their experience and background",
  "keySkills": "Comma-separated list of their main technical and professional skills"
}

Rules:
- userName: Extract the person's full name from the top of the resume
- email: Extract email address if present
- phone: Extract phone number if present (format as-is)
- professionalSummary: Write a concise 2-3 sentence summary capturing their role, experience level, and key strengths
- keySkills: List 8-12 most relevant skills as comma-separated values

If any field cannot be found, use an empty string. Return ONLY the JSON object, no other text.`

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:application/pdf;base64,${base64Data}`,
            },
          },
        ],
      },
    ],
    model: "gpt-4o",
    response_format: { type: "json_object" },
    max_tokens: 800,
    temperature: 0.3,
  })

  const responseText = completion.choices[0]?.message?.content || '{}'

  try {
    const parsed = JSON.parse(responseText) as ParsedResumeData

    // Validate and provide defaults
    return {
      userName: parsed.userName || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      professionalSummary: parsed.professionalSummary || '',
      keySkills: parsed.keySkills || ''
    }
  } catch {
    throw new Error('Failed to parse AI response')
  }
}

async function parseResumeWithAI(resumeText: string): Promise<ParsedResumeData> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const prompt = `You are a resume parser. Extract the following information from this resume and return it as JSON.

Resume Text:
${resumeText}

Extract and return ONLY a JSON object with these exact fields:
{
  "userName": "Full name of the person",
  "email": "Email address (empty string if not found)",
  "phone": "Phone number (empty string if not found)",
  "professionalSummary": "A 2-3 sentence summary of their experience and background",
  "keySkills": "Comma-separated list of their main technical and professional skills"
}

Rules:
- userName: Extract the person's full name from the top of the resume
- email: Extract email address if present
- phone: Extract phone number if present (format as-is)
- professionalSummary: Write a concise 2-3 sentence summary capturing their role, experience level, and key strengths
- keySkills: List 8-12 most relevant skills as comma-separated values

If any field cannot be found, use an empty string. Return ONLY the JSON object, no other text.`

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
    response_format: { type: "json_object" },
    max_tokens: 800,
    temperature: 0.3,
  })

  const responseText = completion.choices[0]?.message?.content || '{}'

  try {
    const parsed = JSON.parse(responseText) as ParsedResumeData

    // Validate and provide defaults
    return {
      userName: parsed.userName || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      professionalSummary: parsed.professionalSummary || '',
      keySkills: parsed.keySkills || ''
    }
  } catch {
    throw new Error('Failed to parse AI response')
  }
}
