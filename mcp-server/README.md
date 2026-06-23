# shortly-mcp

An MCP (Model Context Protocol) server for the URL shortener. Two transports:

- **stdio** — local process, use with Claude Desktop on your own machine
- **HTTP (Streamable)** — deploy to a host (e.g. Render), share with anyone

Both transports share the same tool definitions, so the API surface is identical.

## Prerequisites

- Node.js 18+
- The Express backend (`../app`) running, either locally or deployed

## Install

```bash
cd mcp-server
npm install
cp .env.example .env
# edit .env if your backend isn't on http://localhost:5000
```

## Run

### stdio (local dev)

```bash
npm run dev
```

### HTTP (local dev)

```bash
npm run dev:http
# listening on http://localhost:3001/mcp
# health check at http://localhost:3001/health
```

### Built

```bash
npm run build
npm run start:stdio   # local stdio
npm run start:http    # local HTTP
```

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `SHORTENER_API_BASE` | `http://localhost:5000` | Base URL of the Express backend. Set in `.env` locally, in Render's dashboard for production. |
| `PORT` | `3001` | HTTP listen port. Ignored by the stdio transport. Render sets this automatically. |

## Tools

| Tool | Auth | Description |
|------|------|-------------|
| `register_user` | — | Create a new account. Returns a JWT — auto-logged-in for stdio, paste into client config for hosted use |
| `login` | — | Log in. Returns a JWT — same usage as register_user |
| `logout` | — | Clear the local session (stdio only) |
| `whoami` | — | Show the current session state |
| `shorten_url` | optional | Shorten a long URL |
| `get_my_links` | required | List the authenticated user's links |

## Auth model

Auth is **mixed** — the most common operation (`shorten_url`) works without login, and only `get_my_links` requires a session. This mirrors what the Express backend and the React frontend already do: anonymous shortening is frictionless, the dashboard is auth-gated.

Forcing login on every call would block the killer use case ("AI agent shortens this URL"), so we keep login optional for write operations and required only for the personal dashboard.

## How auth works

**stdio:** the `register_user` and `login` tools store the JWT in process memory. `shorten_url` (if you want the link attached to your account) and `get_my_links` use it automatically. Restarting the process clears it.

**HTTP (hosted):** every request must carry `Authorization: Bearer <jwt>`. The MCP server extracts the token per-request — there is no server-side session state. The server is fully stateless and horizontally scalable. Get the token once during setup (see below), then paste it into your MCP client config.

## Getting started with the hosted MCP

Three steps from zero to using the hosted server.

### 1. If you're new, register:

```bash
curl -X POST https://shortly-mcp.onrender.com/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"hunter22hunter22","name":"Your Name"}'
```

Returns `{ success, message, token }` — the token is included so you can skip the separate login step.

### 2. Get a token (if you already have an account):

```bash
curl -X POST https://shortly-mcp.onrender.com/token \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"hunter22hunter22"}'
```

Returns `{ success, message, token }`.

### 3. Paste the token into your MCP client config:

```json
{
  "mcpServers": {
    "shortly": {
      "url": "https://shortly-mcp.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer <paste-token-here>"
      }
    }
  }
}
```

Restart your MCP client. Now you can use any tool — `shorten_url`, `get_my_links`, etc. — and the token is sent automatically on every request.

**Anonymous use:** if you only need to shorten URLs (no dashboard), skip steps 1-3. Configure the client with just the `url` and no `Authorization` header. `shorten_url` works without auth.

## Use with Claude Desktop

### stdio (local)

```json
{
  "mcpServers": {
    "shortly": {
      "command": "npx",
      "args": ["tsx", "C:/path/to/url_shortner/mcp-server/src/index.ts"],
      "env": {
        "SHORTENER_API_BASE": "http://localhost:5000"
      }
    }
  }
}
```

### HTTP (hosted)

See **"Getting started with the hosted MCP"** above for the full 3-step flow. Quick recap of the client config:

```json
{
  "mcpServers": {
    "shortly": {
      "url": "https://shortly-mcp.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer <paste-jwt-here>"
      }
    }
  }
}
```

## Deploy to Render

1. Push the repo to GitHub
2. In Render: **New** → **Web Service** → connect the repo
3. Set **Root Directory** to `mcp-server`
4. Render auto-detects the Node build. Override the start command to:

   ```
   npm run start:http
   ```

5. Add env vars in the Render dashboard:

   | Key | Value |
   |---|---|
   | `SHORTENER_API_BASE` | `https://your-backend.onrender.com` |
   | `PORT` | `10000` (Render's default; the code reads it automatically) |

6. Add a **Health Check Path** of `/health` so Render keeps the service alive
7. After first deploy, hit `https://shortly-mcp.onrender.com/health` to confirm

> Free Render services sleep after 15 minutes of inactivity, so the first MCP call after idle takes ~30s for cold start. Upgrade to a paid plan or move to Fly.io/Railway for always-on.

## Use with MCP Inspector

```bash
# stdio
npx @anthropic-ai/mcp-inspector npx tsx src/index.ts

# HTTP (server must be running)
npx @anthropic-ai/mcp-inspector http://localhost:3001/mcp
```

When using the Inspector against the HTTP transport, set the `Authorization` header in the Inspector's request config to `Bearer <jwt>`.
