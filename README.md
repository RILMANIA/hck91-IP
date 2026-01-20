# Smart CV Assistant

A full-stack application that uses AI to generate professional CVs from uploaded PDF or Word documents.

## 🚀 Features

- **AI-Powered CV Generation**: Upload raw resume documents and get structured, professional CVs
- **Google Authentication**: Secure login via Supabase Auth
- **Cloud Storage**: Files stored securely in Cloudinary
- **Modern Tech Stack**: React, Redux, Node.js, Express, PostgreSQL
- **Real-time Processing**: Instant CV generation using Google Gemini AI

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (for local development)
- Google Cloud account (for Gemini API)
- Cloudinary account
- Supabase account

## 🛠️ Tech Stack

### Frontend

- **Vite + React** - Fast build tool and UI library
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client

### Backend

- **Node.js + Express** - Server framework
- **Sequelize ORM** - Database management
- **PostgreSQL** - Database (local dev)
- **Supabase PostgreSQL** - Production database
- **Multer** - File upload handling
- **Cloudinary** - File storage
- **Google Gemini AI** - CV generation
- **Supabase Auth** - Authentication

## 📁 Project Structure

```
/
├── client/cvbuilder/          # Frontend React application
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/            # Route pages (Login, Dashboard, UploadCV)
│   │   ├── helpers/          # Redux store, slices, utilities
│   │   ├── App.jsx           # Main app with routing
│   │   └── main.jsx          # Entry point
│   ├── .env                  # Frontend environment variables
│   └── package.json
│
├── server/                   # Backend Express application
│   ├── config/              # Sequelize configuration
│   ├── controllers/         # Request handlers
│   ├── helpers/             # Services (Cloudinary, Gemini, etc.)
│   ├── middlewares/         # Auth, upload, error handling
│   ├── migrations/          # Database migrations
│   ├── models/              # Sequelize models
│   ├── routes/              # API routes
│   ├── seeders/             # Database seeders
│   ├── .env                 # Backend environment variables
│   ├── app.js               # Express app entry point
│   └── package.json
│
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd hck91-IP
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
```

**Configure server/.env:**

```env
PORT=4000
DATABASE_URL=postgres://user:password@localhost:5432/smart_cv
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

**Run migrations:**

```bash
# Create database
createdb smart_cv

# Run migrations
npm run migrate

# (Optional) Seed sample data
npm run seed
```

**Start backend server:**

```bash
npm run dev
```

Server will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd client/cvbuilder

# Install dependencies
npm install
```

**Configure client/cvbuilder/.env:**

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:4000
```

**Start frontend:**

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Getting API Keys

### Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy `URL`, `anon/public key`, and `service_role key`
5. Enable Google OAuth in Authentication > Providers

### Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up and create account
3. From Dashboard, copy `Cloud Name`, `API Key`, and `API Secret`

### Google Gemini AI

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the key

## 🔄 Database Migrations

```bash
# Create a new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Run seeders
npm run seed

# Undo seeders
npm run seed:undo
```

## 📡 API Endpoints

### Health Check

- `GET /health` - Server status

### CV Management

- `POST /api/cvs/upload` - Upload and generate CV (requires auth, multipart/form-data)
- `GET /api/cvs` - Get all user CVs (requires auth)
- `GET /api/cvs/:id` - Get specific CV (requires auth)

## 🔐 Authentication Flow

1. User clicks "Sign in with Google" on login page
2. Supabase handles Google OAuth flow
3. User redirected to dashboard with session token
4. Frontend stores session and includes token in API requests
5. Backend verifies token using Supabase service key

## 📤 CV Upload Flow

1. User selects PDF/Word file
2. File sent to backend via multipart/form-data
3. Backend uploads file to Cloudinary
4. Backend extracts text from file (pdf-parse/mammoth)
5. Text sent to Gemini AI for structured CV generation
6. CV record saved to database
7. Generated CV returned to frontend
8. Redux state updated, CV displayed to user

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests (if configured)
cd client/cvbuilder
npm test
```

## 📦 Deployment

### Backend (e.g., Railway, Render)

1. Set environment variables
2. Update `DATABASE_URL` to use Supabase PostgreSQL
3. Run migrations: `npm run migrate`
4. Start: `npm start`

### Frontend (e.g., Vercel, Netlify)

1. Set environment variables
2. Update `VITE_API_URL` to production backend URL
3. Build: `npm run build`
4. Deploy `dist` folder

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Verify database exists

### File Upload Errors

- Check Cloudinary credentials
- Verify file size < 10MB
- Ensure file type is PDF/DOC/DOCX

### Gemini AI Errors

- Verify API key is valid
- Check API quota/limits
- Ensure proper JSON parsing

## 📝 License

ISC

## 👥 Contributors

Your Name

---

**Happy Coding! 🎉**
