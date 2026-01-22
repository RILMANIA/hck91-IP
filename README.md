# Smart CV Assistant

A full-stack application that uses AI to generate professional CVs from uploaded PDF or Word documents.

## 🚀 Features

- **AI-Powered CV Generation**: Upload raw resume documents and get structured, professional CVs
- **Google OAuth Authentication**: Secure login with Google using google-auth-library
- **Traditional Login**: Email/password authentication with JWT
- **Cloud Storage**: Files stored securely in Cloudinary
- **Modern Tech Stack**: React, Redux Toolkit, Node.js, Express, PostgreSQL
- **Real-time Processing**: Instant CV generation using Google Gemini AI
- **Full CRUD Operations**: Create, read, update, and delete CVs
- **Comprehensive Testing**: 75%+ test coverage with Jest and Supertest

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (for local development)
- Google Cloud account (for Gemini API)
- Cloudinary account
- Google OAuth Client ID (for Google Sign-In)

## 🛠️ Tech Stack

### Frontend

- **Vite + React 19** - Fast build tool and UI library
- **React Router 7** - Client-side routing
- **Redux Toolkit** - State management
- **Axios** - HTTP client
- **Google OAuth** - Google Sign-In integration
- **TailwindCSS** - Styling (if applicable)

### Backend

- **Node.js + Express 5** - Server framework
- **Sequelize ORM 6** - Database management
- **PostgreSQL** - Database
- **Multer** - File upload handling (in-memory)
- **Cloudinary** - Cloud file storage
- **Google Gemini AI** - CV generation
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing
- **google-auth-library** - Google OAuth verification
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX text extraction
- **Jest + Supertest** - Testing framework

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
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
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
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

**Start frontend:**

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔑 Getting API Keys

### Google OAuth Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure consent screen
6. Add authorized JavaScript origins: `http://localhost:5173`, `http://localhost:4000`
7. Copy the Client ID

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

### Authentication

- `POST /register` - Register new user (email, password)
- `POST /login` - Login with email/password
- `POST /google-login` - Login with Google OAuth token

### CV Management (Requires Authentication)

- `POST /api/cvs/upload` - Upload and generate CV (multipart/form-data)
- `GET /api/cvs` - Get all user's CVs
- `GET /api/cvs/:id` - Get specific CV
- `PUT /api/cvs/:id` - Update CV (owner only)
- `DELETE /api/cvs/:id` - Delete CV (owner only)

For detailed API documentation, see [API_DOC.md](server/API_DOC.md)

## 🔐 Authentication Flow

### Google OAuth Flow

1. User clicks "Sign in with Google" on login page
2. Google OAuth popup opens and user authenticates
3. Frontend receives Google credential token
4. Token sent to backend `/google-login` endpoint
5. Backend verifies token using google-auth-library
6. User found/created in database
7. JWT token generated and returned to frontend
8. Frontend stores JWT and redirects to dashboard

### Email/Password Flow

1. User enters email and password
2. For registration: Password hashed with bcrypt and user created
3. For login: Password compared using bcrypt
4. JWT token generated and returned
5. Frontend stores JWT in localStorage
6. JWT included in Authorization header for protected routes

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
# Backend tests (Jest + Supertest)
cd server
npm test

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Overall Coverage**: 75%+
- **56 Passing Tests** across 5 test suites
- Coverage includes:
  - User authentication (register, login, Google OAuth)
  - CV CRUD operations
  - Middleware (authentication, authorization)
  - Helper functions (bcrypt, JWT)
  - Service mocks (Cloudinary, Gemini AI, text extraction)

## 📦 Deployment

### Backend (Railway, Render, Heroku)

1. Set all environment variables (see server/.env section above)
2. Ensure PostgreSQL database is provisioned
3. Run migrations: `npm run migrate`
4. (Optional) Run seeders: `npm run seed`
5. Start: `npm start`

**Important Environment Variables for Production:**

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong secret key for JWT
- `CLOUDINARY_*` - Cloudinary credentials
- `GEMINI_API_KEY` - Google Gemini API key
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `PORT` - Server port (default 4000)

### Frontend (Vercel, Netlify)

1. Set environment variables:
   - `VITE_API_URL` - Production backend URL
   - `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID
2. Build: `npm run build`
3. Deploy `dist` folder
4. Update Google OAuth authorized origins with production URL

## 🐛 Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgres://user:password@host:port/database`
- Verify database exists: `psql -l`
- Run migrations: `npm run migrate`

### Authentication Errors

- **JWT errors**: Ensure `JWT_SECRET` is set in server/.env
- **Google OAuth errors**:
  - Verify `GOOGLE_CLIENT_ID` matches in both frontend and backend
  - Check authorized origins in Google Cloud Console
  - Ensure google-auth-library is installed: `npm list google-auth-library`

### File Upload Errors

- Check Cloudinary credentials are correct
- Verify file size < 10MB
- Ensure file type is PDF/DOC/DOCX
- Check `access_mode: "public"` is set in cloudinaryService.js
- For 401 errors on "View Original": Re-upload CV after Cloudinary fix

### Gemini AI Errors

- Verify API key is valid and active
- Check API quota/limits in Google AI Studio
- Ensure proper JSON parsing in response
- Check extracted text is not empty

### Test Failures

- Ensure `NODE_ENV=test` is set
- Check `JWT_SECRET` is defined before running tests
- Clear test database: `npm run migrate:undo:all && npm run migrate`
- Verify all mocks are properly configured

## 📝 License

ISC

## 👥 Author

Emir Hakim

## 🔗 Links

- [API Documentation](server/API_DOC.md)
- [Google Gemini AI](https://ai.google.dev)
- [Cloudinary](https://cloudinary.com)

---

**Happy Coding! 🎉**
