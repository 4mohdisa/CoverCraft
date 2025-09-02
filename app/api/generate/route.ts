import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface GenerateRequest {
  jobTitle: string
  companyName: string
  jobDescription: string
  extraNotes?: string
}

// Fixed profile data - replace with your actual profile
const PROFILE = {
  name: "Mohammed Isa",
  email: "mohdisa233@gmail.com",
  phone: "0450 106 807",
  skills: "Full-stack development, React, Node.js, TypeScript, JavaScript, Python, MongoDB, Next.js, AI Integration, Web3, Flutter, CSS, C++",
  experience: "Bachelor of IT student with extensive hands-on experience in web development, mobile applications, AI integration, and project management across multiple companies including Stepsharp Digital, Wemark Real Estate, Beyond India, and Reelstar",
  achievements: "Led remote team development of Real Estate CRM, built AI-powered chat applications using OpenAI GPT API, managed IT infrastructure and social media strategies, developed SEO-optimized websites, and created multiple notable projects including Ledgerly, DashGen, Hire Sync AI, and Arabic Text Extraction tools"
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
    if (!body.jobTitle || !body.companyName || !body.jobDescription) {
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

function generateMockCoverLetter(data: GenerateRequest): string {
  const { jobTitle, companyName, jobDescription, extraNotes } = data
  
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With ${PROFILE.experience}, I am excited about the opportunity to contribute to your team.

Based on the job description, I believe my background in ${PROFILE.skills} aligns perfectly with your requirements. ${PROFILE.achievements}, which demonstrates my ability to deliver results and drive innovation.

Key qualifications that make me an ideal candidate:
• Extensive experience with the technologies mentioned in your job posting
• Proven track record of successful project delivery
• Strong problem-solving and analytical skills
• Excellent communication and teamwork abilities

${extraNotes ? `Additional considerations: ${extraNotes}` : ''}

I am particularly drawn to ${companyName} because of your reputation for innovation and excellence. I would welcome the opportunity to discuss how my skills and experience can contribute to your team's continued success.

Thank you for considering my application. I look forward to hearing from you soon.

Best regards,
${PROFILE.name}
${PROFILE.email}
${PROFILE.phone}

---
This cover letter was generated based on the job requirements and tailored to highlight relevant experience and skills.`
}

async function generateWithOpenAI(data: GenerateRequest): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  // Select relevant projects based on job requirements
  const relevantProjects = selectRelevantProjects(data.jobDescription, data.jobTitle)

  const prompt = `You are Mohammed Isa writing a cover letter. Use this EXACT template structure and writing style - conversational, human, and problem-solving focused.

**Job Information:**
- Position: ${data.jobTitle}
- Company: ${data.companyName}
- Job Description: ${data.jobDescription}
- Additional Notes: ${data.extraNotes || 'None'}

**Your Profile:**
- Name: ${PROFILE.name}
- Email: ${PROFILE.email}
- Phone: ${PROFILE.phone}
- Skills: ${PROFILE.skills}
- Experience: ${PROFILE.experience}
- Key Achievements: ${PROFILE.achievements}

**Relevant Projects (Select 3-4 most relevant):**
${relevantProjects.map(project => `- ${project}`).join('\n')}

**STRICT TEMPLATE TO FOLLOW:**

[Opening Hook - Personal philosophy about work]
I like solving problems that other people run from. I don't fix tickets for the count. I fix them because I like leaving systems better than I found them. That's what I want to keep doing, and [COMPANY NAME] feels like the right place to do that with the right people.

Hi

I'm reaching out to introduce myself for the [JOB TITLE] role at [COMPANY NAME]. What stood out to me wasn't just [mention specific thing from job description], but [mention company values/culture aspect]. That's the kind of environment where I've done my best work.

[Current work paragraph - adapt based on experience]
Right now I'm [current role/situation based on experience], handling [relevant technical work]. I've [specific technical achievement], [another achievement], and [third achievement]. Alongside that, I [mention documentation/process improvement], and I follow up so [stakeholders] feel heard—not just helped.

[Projects paragraph]
I've also [led projects/built tools] and built a few tools on the side when things didn't exist, like:

${relevantProjects.map(project => project).join('\n')}

[Personality/Values paragraph]
I'm self-taught, always curious, and happy to work late if it means things run smoother the next morning. What I'm looking for now is a team that values accountability, growth, and solid work over flash. That's what I see at [COMPANY NAME].

Would love the chance to talk further if there's a fit.

Best
Mohammed Isa
mohdisa233@gmail.com
0450 106 807
github.com/4mohdisa
linkedin.com/in/4mohdisa

**WRITING STYLE REQUIREMENTS:**
- Use casual, conversational language 
- Sound human and authentic, not corporate
- Focus on problem-solving mindset
- Keep sentences short and punchy
- Use "I" statements confidently
- No buzzwords or corporate speak
- Make it feel personal and genuine
- Adapt technical details to match the job requirements
- Replace bracketed placeholders with actual job/company info

Generate the cover letter now following this template exactly:`

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o",
    max_tokens: 1000,
    temperature: 0.7,
  })

  return completion.choices[0]?.message?.content || 'Failed to generate cover letter'
}