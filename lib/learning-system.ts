import path from 'path'

interface CoverLetterRecord {
  id: string
  timestamp: string
  jobTitle: string
  companyName: string
  industry?: string
  tone: string
  generatedLetter: string
  userFeedback?: {
    rating: number
    wasUsed: boolean
    gotInterview?: boolean
    comments?: string
  }
  metadata: {
    keySkills?: string
    professionalSummary?: string
  }
}

// Only import fs at runtime, not during build
const getFS = async () => {
  if (typeof window === 'undefined') {
    return (await import('fs/promises')).default
  }
  throw new Error('File system operations are only available on the server')
}

const DATA_DIR = path.join(process.cwd(), 'data')
const LETTERS_FILE = path.join(DATA_DIR, 'cover-letters.json')

async function ensureDataDir() {
  try {
    const fs = await getFS()
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating data directory:', error)
  }
}

async function readLetters(): Promise<CoverLetterRecord[]> {
  try {
    const fs = await getFS()
    const data = await fs.readFile(LETTERS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeLetters(letters: CoverLetterRecord[]): Promise<void> {
  await ensureDataDir()
  const fs = await getFS()
  await fs.writeFile(LETTERS_FILE, JSON.stringify(letters, null, 2))
}

export async function saveCoverLetter(record: Omit<CoverLetterRecord, 'id' | 'timestamp'>): Promise<string> {
  const letters = await readLetters()
  
  const newRecord: CoverLetterRecord = {
    ...record,
    id: `letter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  }
  
  letters.push(newRecord)
  await writeLetters(letters)
  
  return newRecord.id
}

export async function addFeedback(
  letterId: string,
  feedback: CoverLetterRecord['userFeedback']
): Promise<void> {
  const letters = await readLetters()
  const letter = letters.find(l => l.id === letterId)
  
  if (letter) {
    letter.userFeedback = feedback
    await writeLetters(letters)
  }
}

export async function getSuccessfulExamples(
  jobTitle: string,
  tone: string,
  limit: number = 3
): Promise<CoverLetterRecord[]> {
  const letters = await readLetters()
  
  const successfulLetters = letters.filter(letter => {
    const hasGoodFeedback = letter.userFeedback && (
      letter.userFeedback.rating >= 4 ||
      letter.userFeedback.wasUsed ||
      letter.userFeedback.gotInterview
    )
    
    const matchesTone = letter.tone === tone
    const similarJob = letter.jobTitle.toLowerCase().includes(jobTitle.toLowerCase()) ||
                       jobTitle.toLowerCase().includes(letter.jobTitle.toLowerCase())
    
    return hasGoodFeedback && matchesTone && similarJob
  })
  
  return successfulLetters
    .sort((a, b) => {
      const scoreA = (a.userFeedback?.rating || 0) + 
                     (a.userFeedback?.wasUsed ? 2 : 0) + 
                     (a.userFeedback?.gotInterview ? 3 : 0)
      const scoreB = (b.userFeedback?.rating || 0) + 
                     (b.userFeedback?.wasUsed ? 2 : 0) + 
                     (b.userFeedback?.gotInterview ? 3 : 0)
      return scoreB - scoreA
    })
    .slice(0, limit)
}

export async function getStats() {
  const letters = await readLetters()
  
  return {
    totalGenerated: letters.length,
    withFeedback: letters.filter(l => l.userFeedback).length,
    averageRating: letters
      .filter(l => l.userFeedback?.rating)
      .reduce((sum, l) => sum + (l.userFeedback?.rating || 0), 0) / 
      letters.filter(l => l.userFeedback?.rating).length || 0,
    successRate: letters.filter(l => l.userFeedback?.wasUsed).length / letters.length || 0,
  }
}
