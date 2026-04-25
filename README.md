# 🎧 Audio Transcriber (Next.js Full Stack)

A full-stack audio transcription web application built using Next.js, PostgreSQL (Prisma), and cookie-based authentication.

## 🚀 Features

- 🔐 Admin authentication (username & password)
- 🍪 Secure session handling using cookies (no localStorage)
- 🎤 Upload audio files (max 1 minute)
- 🤖 Audio transcription using:
  - Gemini API (primary)
  - AssemblyAI (fallback)
- 💾 Store only transcript text in database
- 📜 View all uploaded transcripts
- 🚪 Logout functionality

## 🛠 Tech Stack

- Frontend: Next.js (App Router) + Tailwind CSS  
- Backend: Next.js API Routes  
- Database: PostgreSQL (Neon)  
- ORM: Prisma  
- Authentication: Cookie-based session (custom)  
- Transcription APIs:  
  - Google Gemini API  
  - AssemblyAI (fallback)

## Live Demo

https://audiotranscriber-production-3ef0.up.railway.app/

## 📂 Project Structure
app/
├── api/
│ ├── login/
│ ├── logout/
│ ├── session/
│ ├── transcribe/
│ └── transcripts/
├── login/
│ └── page.tsx
├── page.tsx
lib/
├── prisma.js
├── auth.js
prisma/
└── schema.prisma

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone https://github.com/chiragmodi3/audio_transcriber.git
cd audio-transcriber

### 2. Install dependencies

npm install

### 3. Setup environment variables

Create .env file:
DATABASE_URL="your_postgresql_url"
GEMINI_API_KEY="your_gemini_api_key"
ASSEMBLYAI_API_KEY="your_assemblyai_api_key"
BETTER_AUTH_URL="http://localhost:3000"

### 4. Setup database

npx prisma db push

### 5. Create Admin User

Use API:
http://localhost:3000/api/create-admin

OR manually insert into DB:
username: admin
password: admin123

### 6. Run the app

npm run dev

Open:
http://localhost:3000

## 🔐 Authentication Flow

- Login → sets cookie (user)
- API routes verify cookie
- Protected routes block unauthorized access
- Logout → clears cookie

## ⚠️ Constraints

- Audio must be less than 1 minute
- Large files are rejected (frontend + backend validation)
- Empty transcripts are not saved

## 📌 API Endpoints
Endpoint	      Method	Description
/api/login	      POST	    Login user
/api/logout	      POST	    Logout
/api/session	  GET	    Check session
/api/transcribe	  POST	    Upload + transcribe
/api/transcripts  GET	    Get transcripts
