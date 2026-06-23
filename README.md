# Full-Stack URL Shortener Service (Short.ly)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack URL shortening service built with the MERN stack (MongoDB, Express.js, React, Node.js) and an accompanying **MCP (Model Context Protocol) server** so AI agents can shorten URLs and read your personal link list. Users can shorten long URLs, track click analytics, and manage their links through a private, authenticated dashboard.

**Live Demo:** *(Add your deployed link here)*

---

## Features

### Web app

- **Anonymous URL Shortening** — Shorten URLs without an account
- **JWT Authentication** — Register and log in securely
- **Auto-Login on Registration** — New users are signed in and redirected to the dashboard immediately
- **Password Hashing** — Passwords hashed with `bcryptjs`
- **Protected Dashboard** — Personal link history for authenticated users
- **Per-User URL Entries** — The same long URL can be shortened by many users; each user has their own short code
- **Click Tracking** — Each shortened URL tracks click counts
- **Automatic Redirection** — Short links redirect to the original destination
- **Copy to Clipboard** — One-click copy with visual "Copied!" feedback
- **Loading States** — Spinner component during API calls
- **Client-side Validation** — Inline field validation before form submission
- **Sanitized Error Responses** — 4xx errors echo a clean message; 5xx errors return a generic message and hide internal stack traces in production
- **Responsive UI** — Styled with Tailwind CSS v4

### MCP server (`mcp-server/`)

- **Two transports** — stdio (local process) and HTTP (deployable, e.g. Render)
- **Same tool surface** across both transports
- **Mixed auth model** — `shorten_url` works anonymously, `get_my_links` requires a JWT
- **Stateless HTTP mode** — token is sent per-request via `Authorization: Bearer <jwt>`, no server-side session
- **Auth-setup endpoints** — `POST /register` and `POST /token` on the hosted server for one-time JWT retrieval
- **In-app setup guide** — `/mcp-guide` page in the React UI shows the user's JWT, ready-to-paste client configs, and the Inspector command

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
| nodeman | Dev-server hot reload |

### Frontend (`ui/`)

| Tool | Purpose |
|------|---------|
| React + Vite | UI framework and build tool |
| React Router | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Fetch API | HTTP requests |
| React Context API | Auth state management |

### MCP server (`mcp-server/`)

| Tool | Purpose |
|------|---------|
| TypeScript | Source language |
| Node.js + tsx | Local dev runtime |
| @modelcontextprotocol/sdk | MCP server framework |
| Express.js | HTTP transport |
| Zod | Tool input validation |
| dotenv | Env-var loading |

---

## Project Structure

```
├── app/                  # Backend (Express + MongoDB)
│   ├── config/           # DB connection, etc.
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth + error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express route definitions
│   ├── index.js          # Server entry point
│   └── package.json
├── ui/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context providers
│   │   ├── pages/        # Route page components (Home, Login, Register, Dashboard, McpGuide)
│   │   └── services/     # API service layer
│   └── package.json
├── mcp-server/           # MCP server (stdio + HTTP)
│   ├── src/
│   │   ├── index.ts      # stdio transport entry
│   │   ├── http.ts       # HTTP transport entry (also exposes /register and /token)
│   │   ├── tools.ts      # MCP tool definitions
│   │   ├── apiClient.ts  # Backend API client
│   │   └── authContext.ts
│   ├── package.json
│   └── README.md         # Full MCP-server docs
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

### 4. MCP Server Setup (optional)

Only needed if you want to use the local stdio MCP transport or run the hosted HTTP server yourself.

```bash
cd ../mcp-server
npm install
cp .env.example .env
# edit .env so SHORTENER_API_BASE points at your backend
```

### 5. Run the Application

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

**Terminal 3 — MCP server (local stdio):**

```bash
cd mcp-server
npm run dev
```

**Terminal 4 — MCP server (local HTTP, optional):**

```bash
cd mcp-server
npm run dev:http    # http://localhost:3001/mcp
```

For the full MCP-server setup, hosted deployment, and Claude Desktop configuration, see [mcp-server/README.md](mcp-server/README.md). The in-app guide at `http://localhost:5173/mcp-guide` shows the user's JWT and ready-to-paste snippets once they're logged in.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user. **Returns a JWT** so the client can auto-log in. |
| POST | `/api/auth/login` | No | Log in. Returns a JWT. |
| POST | `/api/shorten` | No | Create a short URL. Per-user uniqueness: the same `longUrl` can exist once per user. |
| GET | `/:code` | No | Redirect to original URL. |
| GET | `/api/links/my-links` | Yes | Get the authenticated user's links. |

**Error responses** are sanitized: client errors (4xx) echo a clean message, server errors (5xx) return a generic `"Internal server error"` and hide the stack trace outside development.

### MCP-server HTTP endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/mcp` | Streamable HTTP MCP transport (auth via `Authorization: Bearer <jwt>`) |
| POST | `/register` | One-shot register; returns the JWT |
| POST | `/token` | One-shot login; returns the JWT |

---

## MCP Tools

Exposed by the MCP server (both transports):

| Tool | Auth | Description |
|------|------|-------------|
| `register_user` | — | Create a new account. The backend returns a JWT in the same response, auto-stored in the local session (stdio) or printed in the response for hosted use. |
| `login` | — | Log in. Returns a JWT (same usage as `register_user`). |
| `logout` | — | Clear the local session (stdio only). |
| `whoami` | — | Show the current session state. |
| `shorten_url` | optional | Shorten a long URL. |
| `get_my_links` | required | List the authenticated user's links. |

---

## License

This project is licensed under the MIT License.
