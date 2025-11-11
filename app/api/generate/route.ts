import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

type ToneType = 'professional' | 'conversational' | 'enthusiastic' | 'formal'

interface GenerateRequest {
  // User Information
  userName: string
  email?: string
  phone?: string
  professionalSummary?: string
  keySkills?: string

  // Job Information
  jobTitle: string
  companyName: string
  jobDescription: string
  extraNotes?: string

  // Tone & Style
  tone: ToneType
}

// Project database for intelligent selection based on job requirements
const PROJECTS = {
  // AI & Machine Learning Projects
  ai: [
    {
      name: "Hire Sync AI",
      description: "AI-powered job board with intelligent job matching and resume analysis",
      tech: "Next.js, PostgreSQL, Anthropic Claude, Google Gemini, TypeScript",
      keywords: ["ai", "machine learning", "job matching", "resume analysis", "next.js", "postgresql"]
    },
    {
      name: "DashGen",
      description: "AI-powered dashboard generator with smart data visualization",
      tech: "Next.js, TypeScript, Llama 3.1 405B, Recharts, PostgreSQL",
      keywords: ["ai", "dashboard", "data visualization", "llama", "analytics", "charts"]
    },
    {
      name: "Arabic Text Extraction",
      description: "OCR tool with GPT-4o Vision for Arabic text recognition",
      tech: "Next.js, OpenAI GPT-4o Vision, Tesseract.js, TypeScript",
      keywords: ["ocr", "gpt-4", "text extraction", "arabic", "computer vision", "ai"]
    },
    {
      name: "ChatGennie AI",
      description: "AI chatbot mobile application",
      tech: "Flutter, AI Integration",
      keywords: ["flutter", "mobile", "chatbot", "ai", "mobile development"]
    }
  ],
  
  // Full-Stack Web Development
  fullstack: [
    {
      name: "Vibes",
      description: "Real-time MERN chat application with WebSocket communication",
      tech: "MongoDB, Express, React, Node.js, Socket.io, Redux Toolkit",
      keywords: ["mern", "real-time", "chat", "websocket", "socket.io", "react", "mongodb"]
    },
    {
      name: "NextJ-SaaS-ShipFast",
      description: "Production-ready SaaS boilerplate with billing and authentication",
      tech: "Next.js 14, Convex, Clerk, Stripe, TypeScript, Tailwind CSS",
      keywords: ["saas", "boilerplate", "stripe", "authentication", "billing", "next.js"]
    },
    {
      name: "Ledgerly",
      description: "Personal finance management with transaction tracking",
      tech: "Next.js 14, TypeScript, Supabase, Redux Toolkit, Tailwind CSS",
      keywords: ["finance", "tracking", "supabase", "redux", "personal finance", "transactions"]
    },
    {
      name: "Nexlify",
      description: "Modern web development project",
      tech: "Next.js, TypeScript, Modern Web Technologies",
      keywords: ["next.js", "typescript", "web development", "modern"]
    }
  ],
  
  // Blockchain & Web3
  blockchain: [
    {
      name: "Supply Chain DAPP",
      description: "Blockchain supply chain management with IoT integration",
      tech: "Ethereum, Solidity, React, FastAPI, Arduino, DHT11 sensors",
      keywords: ["blockchain", "ethereum", "solidity", "supply chain", "iot", "dapp", "smart contracts"]
    },
    {
      name: "Web3 Chat Application",
      description: "Decentralized chat platform on blockchain",
      tech: "Next.js, Web3, Tailwind CSS",
      keywords: ["web3", "blockchain", "decentralized", "chat", "next.js"]
    }
  ],
  
  // Data & Automation
  automation: [
    {
      name: "TextExtraction-GoogleSheets",
      description: "Automated text extraction to Google Sheets integration",
      tech: "Python, Google Sheets API, Text Processing",
      keywords: ["automation", "google sheets", "text extraction", "python", "api integration"]
    },
    {
      name: "Python Email Scraper",
      description: "Email data extraction and processing tool",
      tech: "Python, Web Scraping, Data Processing",
      keywords: ["python", "scraping", "email", "data processing", "automation"]
    },
    {
      name: "X Finder",
      description: "Search and discovery tool",
      tech: "Web Technologies, Search Algorithms",
      keywords: ["search", "discovery", "algorithms", "web"]
    }
  ],
  
  // Enterprise & Management
  enterprise: [
    {
      name: "Crime Management System",
      description: "Law enforcement management system",
      tech: "Database Management, System Architecture",
      keywords: ["management system", "database", "enterprise", "system design"]
    },
    {
      name: "Next WordPress Blog",
      description: "Modern blogging platform with WordPress backend",
      tech: "Next.js, WordPress, Content Management",
      keywords: ["wordpress", "blog", "cms", "content management", "next.js"]
    }
  ]
}

function selectRelevantProjects(jobDescription: string, jobTitle: string): string[] {
  const jobText = `${jobDescription} ${jobTitle}`.toLowerCase()
  const selectedProjects: Array<{name: string, description: string, score: number}> = []
  
  // Analyze all projects and score them based on keyword matches
  Object.values(PROJECTS).flat().forEach(project => {
    let score = 0
    project.keywords.forEach(keyword => {
      if (jobText.includes(keyword)) {
        score += 1
      }
    })
    
    if (score > 0) {
      selectedProjects.push({
        name: project.name,
        description: project.description,
        score: score
      })
    }
  })
  
  // Sort by relevance score and return top 4
  const topProjects = selectedProjects
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(p => `${p.name} – ${p.description}`)
  
  // If no relevant projects found, return default popular projects
  if (topProjects.length === 0) {
    return [
      "Hire Sync AI – AI-powered job board with intelligent matching",
      "DashGen – AI-powered dashboard generator", 
      "Vibes – Real-time MERN chat application",
      "Ledgerly – Personal finance management platform"
    ]
  }
  
  return topProjects
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()

    // Validate required fields
    if (!body.userName || !body.jobTitle || !body.companyName || !body.jobDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate cover letter using OpenAI
    const coverLetter = await generateWithOpenAI(body)

    return NextResponse.json({ body: coverLetter })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Mock function kept for testing purposes (not currently used in production)
function generateMockCoverLetter(data: GenerateRequest): string {
  const { userName, email, phone, jobTitle, companyName, extraNotes, professionalSummary, keySkills } = data

  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}.${professionalSummary ? ` ${professionalSummary}` : ''}

${keySkills ? `My background in ${keySkills} aligns well with your requirements.` : ''}

Key qualifications that make me an ideal candidate:
• Relevant experience with the technologies mentioned in your job posting
• Proven track record of successful project delivery
• Strong problem-solving and analytical skills
• Excellent communication and teamwork abilities

${extraNotes ? `Additional considerations: ${extraNotes}` : ''}

I am particularly drawn to ${companyName} and would welcome the opportunity to discuss how my skills and experience can contribute to your team's continued success.

Thank you for considering my application. I look forward to hearing from you soon.

Best regards,
${userName}${email ? `\n${email}` : ''}${phone ? `\n${phone}` : ''}

---
This cover letter was generated based on the job requirements and tailored to highlight relevant experience and skills.`
}

// Helper function to get tone-specific instructions
function getToneInstructions(tone: ToneType): string {
  const toneGuides = {
    conversational: `
      - Use casual, conversational language
      - Sound human and authentic, not corporate
      - Focus on problem-solving mindset
      - Keep sentences short and punchy
      - Use "I" statements confidently
      - No buzzwords or corporate speak
      - Make it feel personal and genuine`,

    professional: `
      - Use professional but approachable language
      - Balance formality with personality
      - Demonstrate competence without being overly casual
      - Use complete sentences with proper structure
      - Show enthusiasm while maintaining professionalism
      - Avoid slang but don't be stiff`,

    enthusiastic: `
      - Show genuine excitement about the opportunity
      - Use energetic and positive language
      - Express passion for the work and company
      - Be dynamic and engaging in tone
      - Demonstrate eagerness to contribute
      - Maintain professionalism while showing personality`,

    formal: `
      - Use traditional, formal business language
      - Maintain professional distance
      - Use complete, well-structured sentences
      - Follow traditional cover letter conventions
      - Be respectful and courteous throughout
      - Demonstrate seriousness and commitment`
  }

  return toneGuides[tone]
}

async function generateWithOpenAI(data: GenerateRequest): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // Select relevant projects based on job requirements (if we still want to use this feature)
  const relevantProjects = selectRelevantProjects(data.jobDescription, data.jobTitle)

  // Build user profile section
  const userProfile = `
- Name: ${data.userName}${data.email ? `\n- Email: ${data.email}` : ''}${data.phone ? `\n- Phone: ${data.phone}` : ''}${data.keySkills ? `\n- Skills: ${data.keySkills}` : ''}${data.professionalSummary ? `\n- Experience: ${data.professionalSummary}` : ''}`

  // Get tone-specific instructions
  const toneInstructions = getToneInstructions(data.tone)

  const prompt = `You are ${data.userName} writing a cover letter for a job application.

**Job Information:**
- Position: ${data.jobTitle}
- Company: ${data.companyName}
- Job Description: ${data.jobDescription}
- Additional Notes: ${data.extraNotes || 'None'}

**Your Profile:**
${userProfile}

**Writing Tone:** ${data.tone.charAt(0).toUpperCase() + data.tone.slice(1)}

**TONE & STYLE REQUIREMENTS:**
${toneInstructions}

**STRUCTURE GUIDELINES:**
1. Opening: Strong hook that shows genuine interest in the company/role
2. Introduction: Brief introduction connecting your background to the role
3. Qualifications: Highlight 2-3 key qualifications that match the job requirements
4. Value Proposition: Explain what you bring to the company
5. Closing: Professional closing with clear call to action

**IMPORTANT INSTRUCTIONS:**
- Tailor the content specifically to the job description provided
- ${data.keySkills ? 'Incorporate the skills mentioned in the profile naturally' : 'Focus on general qualifications'}
- ${data.professionalSummary ? 'Reference the experience provided in the profile' : 'Keep experience section brief and adaptable'}
- Match the job description keywords and requirements
- Keep the letter concise (250-400 words)
- Make it feel authentic and personal to ${data.userName}
- Include appropriate contact information at the end
- Replace generic statements with specific, relevant details from the job description

Generate the cover letter now:`

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
    max_tokens: 1000,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || 'Failed to generate cover letter'
}