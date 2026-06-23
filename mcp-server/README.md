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
| `register_user` | — | Create a new account |
| `login` | — | Log in. Returns a JWT — paste it into the client config for hosted use |
| `logout` | — | Clear the local session (stdio only) |
| `whoami` | — | Show the current session state |
| `shorten_url` | optional | Shorten a long URL |
| `get_my_links` | required | List the authenticated user's links |

## How auth works

**stdio:** the `login` tool stores the JWT in process memory. `shorten_url` and `get_my_links` use it automatically. Restarting the process clears it.

**HTTP:** every request must carry `Authorization: Bearer <jwt>`. The MCP server extracts the token per-request — there is no server-side session state. Get the token once via `login` (or by calling the backend's `/api/auth/login` directly), then paste it into your MCP client config. The server is fully stateless and horizontally scalable.

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

To get the JWT, either call the `login` tool once via the MCP Inspector or curl the backend:

```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpass"}'
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
