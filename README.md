# Full-Stack URL Shortener Service (Short.ly)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack URL shortening service built with the MERN stack (MongoDB, Express.js, React, Node.js). Users can shorten long URLs, track click analytics, and manage their links through a private, authenticated dashboard.

**Live Demo:** *(Add your deployed link here)*

---

### Demo

![Short.ly Demo](placeholder.gif)

*A short GIF demonstrating the core user flow: shortening a URL, logging in, and viewing the link on the personal dashboard.*

---

## Features

- **Anonymous URL Shortening** — Shorten URLs without an account
- **JWT Authentication** — Register and log in securely
- **Password Hashing** — Passwords hashed with `bcryptjs`
- **Protected Dashboard** — Personal link history for authenticated users
- **Click Tracking** — Each shortened URL tracks click counts
- **Automatic Redirection** — Short links redirect to the original destination
- **Copy to Clipboard** — One-click copy with visual "Copied!" feedback
- **Loading States** — Spinner component during API calls
- **Client-side Validation** — Inline field validation before form submission
- **Consistent Error Handling** — Full-stack error pipeline with user-friendly messages
- **Responsive UI** — Styled with Tailwind CSS v4

---

## Tech Stack

### Backend (`app/`)

| Tool | Purpose |
|------|---------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MongoDB + Mongoose | Database and ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| nanoid | Short URL code generation |

### Frontend (`ui/`)

| Tool | Purpose |
|------|---------|
| React + Vite | UI framework and build tool |
| React Router | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Fetch API | HTTP requests |
| React Context API | Auth state management |

---

## Project Structure

```
├── app/                  # Backend (Express + MongoDB)
│   ├── controllers/      # Route handlers
│   ├── middleware/        # Auth + error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   ├── index.js          # Server entry point
│   └── .env              # Environment variables
├── ui/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context providers
│   │   ├── pages/        # Route page components
│   │   └── services/     # API service layer
│   └── package.json
└── README.md
```

---

## Installation and Setup

### Prerequisites

- Node.js v18+
- npm
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/Apsinghsa/url-shortner-pro.git
cd url-shortner-pro
```

### 2. Backend Setup

```bash
cd app
npm install
```

Create `app/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/shortly?retryWrites=true&w=majority
BASE_URL=http://localhost:5000
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Frontend Setup

```bash
cd ../ui
npm install
```

### 4. Run the Application

**Terminal 1 — Backend:**

```bash
cd app
npm run dev
```

Backend runs on `http://localhost:5000`.

**Terminal 2 — Frontend:**

```bash
cd ui
npm run dev
```

Frontend runs on `http://localhost:5173`.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in an existing user |
| POST | `/api/shorten` | No | Create a short URL |
| GET | `/:code` | No | Redirect to original URL |
| GET | `/api/links/my-links` | Yes | Get user's links |

---

## License

This project is licensed under the MIT License.
