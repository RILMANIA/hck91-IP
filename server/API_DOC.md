# Smart CV Assistant API Documentation

Base URL: `http://localhost:4000`

## Table of Contents

- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Protected Endpoints](#protected-endpoints)
- [Error Responses](#error-responses)

---

## Authentication

Protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

The token is obtained after successful login or registration.

---

## Public Endpoints

### 1. Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Request:**

```http
GET /health HTTP/1.1
Host: localhost:4000
```

**Response:**

```json
{
  "status": "ok",
  "message": "Smart CV Assistant API is running",
  "timestamp": "2026-01-20T12:00:00.000Z"
}
```

**Status Code:** `200 OK`

---

### 2. User Registration

Register a new user account.

**Endpoint:** `POST /register`

**Request:**

```http
POST /register HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**

```json
{
  "id": 1,
  "email": "user@example.com"
}
```

**Status Code:** `201 Created`

**Response (Error - Email Already Exists):**

```json
{
  "message": "Email already exists"
}
```

**Status Code:** `400 Bad Request`

---

### 3. User Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /login`

**Request:**

```http
POST /login HTTP/1.1
Host: localhost:4000
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (Success):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `200 OK`

**Response (Error - Invalid Credentials):**

```json
{
  "message": "Invalid email or password"
}
```

**Status Code:** `401 Unauthorized`

---

## Protected Endpoints

All endpoints below require authentication via JWT token.

### 4. Upload CV

Upload a PDF or Word document to generate a structured CV.

**Endpoint:** `POST /api/cvs/upload`

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request:**

```http
POST /api/cvs/upload HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="resume.pdf"
Content-Type: application/pdf

<file content>
------WebKitFormBoundary--
```

**Form Data:**

- `file` (File, required): PDF or DOCX file containing the CV

**Response (Success):**

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

**Status Code:** `201 Created`

**Response (Error - No File):**

```json
{
  "message": "No file uploaded"
}
```

**Status Code:** `400 Bad Request`

---

### 5. Get User's CVs

Retrieve all CVs belonging to the authenticated user.

**Endpoint:** `GET /api/cvs`

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```http
GET /api/cvs HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**

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
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "userId": 1,
    "original_file_url": "https://res.cloudinary.com/xxx/cv_uploads/def456.pdf",
    "generated_cv": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "skills": ["Python", "Django", "PostgreSQL"]
    },
    "createdAt": "2026-01-19T10:00:00.000Z",
    "updatedAt": "2026-01-19T10:00:00.000Z"
  }
]
```

**Status Code:** `200 OK`

**Note:** Results are ordered by `createdAt` in descending order (newest first).

---

### 6. Get CV by ID

Retrieve a specific CV by its ID.

**Endpoint:** `GET /api/cvs/:id`

**Headers:**

```
Authorization: Bearer <token>
```

**Request:**

```http
GET /api/cvs/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:4000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success):**

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

**Status Code:** `200 OK`

**Response (Error - CV Not Found):**

```json
{
  "message": "CV not found"
}
```

**Status Code:** `404 Not Found`

---

## Error Responses

### Common Error Codes

| Status Code | Description                                            |
| ----------- | ------------------------------------------------------ |
| 400         | Bad Request - Invalid input or missing required fields |
| 401         | Unauthorized - Missing or invalid authentication token |
| 403         | Forbidden - Insufficient permissions                   |
| 404         | Not Found - Resource does not exist                    |
| 500         | Internal Server Error - Server-side error              |

### Error Response Format

All error responses follow this structure:

```json
{
  "message": "Error description here"
}
```

### Authentication Errors

**Missing Token:**

```json
{
  "message": "Authentication required"
}
```

**Invalid Token:**

```json
{
  "message": "Invalid token"
}
```

### Validation Errors

**Missing Required Fields:**

```json
{
  "message": "Email and password are required"
}
```

**Invalid Email Format:**

```json
{
  "message": "Invalid email format"
}
```

---

## Data Models

### User

```typescript
{
  id: number,
  email: string,
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### CV

```typescript
{
  id: UUID,
  userId: number,
  original_file_url: string | null,
  generated_cv: {
    name?: string,
    email?: string,
    phone?: string,
    summary?: string,
    education?: Array<{
      degree: string,
      institution: string,
      year: string
    }>,
    experience?: Array<{
      title: string,
      company: string,
      duration: string,
      description: string
    }>,
    skills?: string[]
  } | null,
  createdAt: Date,
  updatedAt: Date
}
```

---

## File Upload Specifications

### Supported File Types

- PDF (.pdf)
- Microsoft Word (.doc, .docx)

### File Size Limit

- Maximum: 10MB (configurable via Multer middleware)

### Processing Flow

1. File uploaded via multipart/form-data
2. File stored in Cloudinary
3. Text extracted from PDF/Word document
4. Text processed by Google Gemini AI
5. Structured CV data generated and stored in database

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs follow RFC 4122 version 4
- Passwords are hashed using bcrypt before storage
- JWT tokens expire based on server configuration
- CORS is enabled for all origins (configure for production)
