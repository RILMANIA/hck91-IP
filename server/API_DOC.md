# Smart CV Assistant API Documentation

## Models

### User

```
- id : integer, auto-increment, primary key
- email : string, required, unique
- password : string, required, hashed with bcrypt
- createdAt : timestamp, auto-generated
- updatedAt : timestamp, auto-generated
```

### CV

```
- id : UUID, primary key
- userId : integer, required (FK User)
- original_file_url : string, optional (Cloudinary URL)
- generated_cv : JSON, optional (structured CV data)
- createdAt : timestamp, auto-generated
- updatedAt : timestamp, auto-generated
```

### Generated CV Structure (JSON)

```
- name : string, optional
- email : string, optional
- phone : string, optional
- summary : string, optional
- education : array of objects, optional
  - degree : string
  - institution : string
  - year : string
- experience : array of objects, optional
  - title : string
  - company : string
  - duration : string
  - description : string
- skills : array of strings, optional
```

## Relations

- User (1) --- (M) CV via `userId`

## Base URL

- Local: `http://localhost:4000`

## Endpoints

List of available endpoints:

- `GET /health`
- `POST /register`
- `POST /login`
- `POST /google-login`

Routes below need authentication (Authorization: Bearer `<token>`):

- `POST /api/cvs/upload`
- `GET /api/cvs`
- `GET /api/cvs/:id`
- `PUT /api/cvs/:id`
- `DELETE /api/cvs/:id`

Routes below need authentication & authorization:

- `PUT /api/cvs/:id` (User owner only)
- `DELETE /api/cvs/:id` (User owner only)

### 1. GET /health

Description: Check if the API is running.

Response (200 - OK):

```json
{
  "status": "ok",
  "message": "Smart CV Assistant API is running",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

### 2. POST /register

Description: Register a new user account.

Request body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response (201 - Created):

```json
{
  "id": 1,
  "email": "user@example.com"
}
```

Response (400 - Bad Request):

```json
{ "message": "Email already exists" }
```

### 3. POST /login

Description: Authenticate with email and password, receive a JWT token.

Request body:

```json
{
  "email": "string",
  "password": "string"
}
```

Response (200 - OK):

```json
{
  "access_token": "string"
}
```

Response (401 - Unauthorized):

```json
{ "message": "Invalid email or password" }
```

### 4. POST /google-login

Description: Authenticate with Google OAuth, receive a JWT token.

Request body:

```json
{
  "googleToken": "string"
}
```

Response (200 - OK):

```json
{
  "access_token": "string"
}
```

Response (401 - Unauthorized):

```json
{ "message": "Invalid Google token" }
```

### 5. POST /api/cvs/upload

Authentication: Bearer token.

Description: Upload a PDF or DOCX file to generate a structured CV using Google Gemini AI.

Request:

- Content-Type: multipart/form-data
- Body: `file` (PDF or DOCX file, max 10MB)

Response (201 - Created):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": 1,
  "original_file_url": "https://res.cloudinary.com/xxx/cv_uploads/abc123.pdf",
  "generated_cv": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "summary": "Experienced software engineer with 5 years in web development...",
    "education": [
      {
        "degree": "Bachelor of Computer Science",
        "institution": "University of Example",
        "year": "2020"
      }
    ],
    "experience": [
      {
        "title": "Software Engineer",
        "company": "Tech Corp",
        "duration": "2020-2023",
        "description": "Developed web applications using React and Node.js..."
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "PostgreSQL"]
  },
  "createdAt": "2026-01-20T12:00:00.000Z",
  "updatedAt": "2026-01-20T12:00:00.000Z"
}
```

Response (400 - Bad Request):

```json
{ "message": "No file uploaded" }
```

Response (401 - Unauthorized):

```json
{ "message": "Invalid token" }
```

### 6. GET /api/cvs

Authentication: Bearer token.

Description: Retrieve all CVs belonging to the authenticated user, ordered by creation date (newest first).

Response (200 - OK):

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": 1,
    "original_file_url": "https://res.cloudinary.com/xxx/cv_uploads/abc123.pdf",
    "generated_cv": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "skills": ["JavaScript", "React", "Node.js"]
    },
    "createdAt": "2026-01-20T12:00:00.000Z",
    "updatedAt": "2026-01-20T12:00:00.000Z"
  }
]
```

Response (401 - Unauthorized):

```json
{ "message": "Invalid token" }
```

### 7. GET /api/cvs/:id

Authentication: Bearer token.

Description: Retrieve a specific CV by its ID.

Response (200 - OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": 1,
  "original_file_url": "https://res.cloudinary.com/xxx/cv_uploads/abc123.pdf",
  "generated_cv": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "summary": "Experienced software engineer...",
    "education": [
      {
        "degree": "Bachelor of Computer Science",
        "institution": "University of Example",
        "year": "2020"
      }
    ],
    "experience": [
      {
        "title": "Software Engineer",
        "company": "Tech Corp",
        "duration": "2020-2023",
        "description": "Developed web applications..."
      }
    ],
    "skills": ["JavaScript", "React", "Node.js", "PostgreSQL"]
  },
  "createdAt": "2026-01-20T12:00:00.000Z",
  "updatedAt": "2026-01-20T12:00:00.000Z"
}
```

Response (401 - Unauthorized):

```json
{ "message": "Invalid token" }
```

Response (403 - Forbidden):

```json
{ "message": "Access denied" }
```

Response (404 - Not Found):

```json
{ "message": "CV not found" }
```

### 8. PUT /api/cvs/:id

Authentication: Bearer token. Authorization: User owner only.

Description: Update the generated CV data for a specific CV.

Request body (partial update accepted):

```json
{
  "generated_cv": {
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+0987654321",
    "summary": "Updated summary...",
    "education": [
      {
        "degree": "Master of Computer Science",
        "institution": "Advanced University",
        "year": "2022"
      }
    ],
    "experience": [
      {
        "title": "Senior Software Engineer",
        "company": "New Tech Corp",
        "duration": "2023-Present",
        "description": "Leading development team..."
      }
    ],
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"]
  }
}
```

Response (200 - OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "userId": 1,
  "original_file_url": "https://res.cloudinary.com/xxx/cv_uploads/abc123.pdf",
  "generated_cv": {
    "name": "John Doe Updated",
    "email": "john.updated@example.com",
    "phone": "+0987654321",
    "summary": "Updated summary...",
    "education": [
      {
        "degree": "Master of Computer Science",
        "institution": "Advanced University",
        "year": "2022"
      }
    ],
    "experience": [
      {
        "title": "Senior Software Engineer",
        "company": "New Tech Corp",
        "duration": "2023-Present",
        "description": "Leading development team..."
      }
    ],
    "skills": ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL"]
  },
  "createdAt": "2026-01-20T12:00:00.000Z",
  "updatedAt": "2026-01-21T10:30:00.000Z"
}
```

Response (401 - Unauthorized):

```json
{ "message": "Invalid token" }
```

Response (403 - Forbidden):

```json
{ "message": "Access denied" }
```

Response (404 - Not Found):

```json
{ "message": "CV not found" }
```

### 9. DELETE /api/cvs/:id

Authentication: Bearer token. Authorization: User owner only.

Description: Delete a specific CV by its ID.

Response (200 - OK):

```json
{ "message": "CV deleted successfully" }
```

Response (401 - Unauthorized):

```json
{ "message": "Invalid token" }
```

Response (403 - Forbidden):

```json
{ "message": "Access denied" }
```

Response (404 - Not Found):

```json
{ "message": "CV not found" }
```

## Global Errors

Response (400 - Bad Request):

```json
{ "message": "Error description" }
```

Response (401 - Unauthorized):

```json
{ "message": "Invalid token" }
```

Response (403 - Forbidden):

```json
{ "message": "Access denied" }
```

Response (404 - Not Found):

```json
{ "message": "CV not found" }
```

Response (500 - Internal Server Error):

```json
{ "message": "Internal server error" }
```

## Technical Details

### File Upload

- Supported formats: PDF (.pdf), Microsoft Word (.doc, .docx)
- Maximum file size: 10MB
- Storage: Cloudinary
- Processing: Text extraction (pdf-parse, mammoth) → Google Gemini AI → Structured JSON

### Authentication

- Method: JWT (JSON Web Token)
- Header: `Authorization: Bearer <token>`
- Password hashing: bcrypt
- Google OAuth: google-auth-library

### AI Processing

- Provider: Google Gemini API
- Purpose: Extract structured CV information from unstructured text
- Output: JSON object with name, email, phone, summary, education, experience, skills
