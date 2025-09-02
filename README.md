# Cover Letter Generator

A minimalist web application that generates tailored cover letters for job applications using AI. Simply paste a job posting and get a personalized cover letter based on your profile.

## Features

- **Clean, minimalist design** with white and black theme
- **Mobile-first responsive layout** with max 720px width
- **Form validation** with inline error messages
- **Real-time character counting** for text areas
- **Copy to clipboard** functionality with success notifications
- **Local storage persistence** for form data and generated letters
- **Error handling** with retry functionality
- **Loading states** with spinners and disabled buttons

## Tech Stack

- **Next.js 15** with React 18
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **OpenAI API** integration (backend only)
- **Local Storage** for state persistence

## Components

### Reusable UI Components
- `InputField` - Text input with validation and error states
- `TextAreaField` - Textarea with character counter and validation
- `CustomButton` - Button with primary, secondary, ghost variants and loading states
- `CustomCard` - Card layout component with optional title and description
- `AlertBanner` - Alert messages for errors, success, and info
- `Spinner` - Loading spinner in multiple sizes

### Main Component
- `CoverLetterGenerator` - Main form component with all functionality

## Form Fields

- **Job Title** (required) - The position you're applying for
- **Company Name** (required) - Name of the hiring company
- **Job Location** (optional) - Location of the job
- **Job Link** (optional) - URL to the job posting (validated)
- **Job Description** (required) - Full job posting content
- **Extra Notes** (optional) - Additional information to include

## API

### POST /api/generate

Generates a tailored cover letter based on job details and fixed user profile.

**Request:**
```json
{
  "jobTitle": "Senior Software Engineer",
  "companyName": "Tech Corp",
  "location": "San Francisco, CA",
  "jobUrl": "https://company.com/jobs/123",
  "jobDescription": "We are looking for...",
  "extraNotes": "Additional context..."
}
```

**Response:**
```json
{
  "body": "Dear Hiring Manager,\n\nI am writing to express..."
}
```

## User Profile

The application uses a fixed user profile stored in the backend:
- Name and contact information
- Skills and technologies
- Years of experience
- Key achievements

To customize the profile, edit the `PROFILE` object in `/app/api/generate/route.ts`.

## Local Storage

The app automatically saves:
- Form data as you type
- Last generated cover letter
- Restores state on page reload

## Validation

- Required fields must be filled
- Job URL must be a valid URL format
- Form submission disabled until all validations pass
- Real-time error clearing as user types

## Usage

1. Fill in the job details form
2. Paste the job description from job boards like Seek, Indeed, or LinkedIn
3. Add any extra notes if needed
4. Click "Generate Letter" to create your cover letter
5. Copy the generated letter to your clipboard
6. Use "Clear Form" to reset all fields

## Development

```bash
npm run dev
```

The app runs on `http://localhost:3000` with hot reloading enabled.

## Future Enhancements

- OpenAI API integration for better letter generation
- Multiple user profiles
- Cover letter templates
- Export to PDF
- Job application tracking