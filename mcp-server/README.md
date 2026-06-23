# shortly-mcp

An MCP (Model Context Protocol) server that exposes the URL shortener REST API as tools for AI agents. Communicates over stdio.

## Prerequisites

- Node.js 18+
- The Express backend (`../app`) running locally on port 5000 (or set `SHORTENER_API_BASE`)

## Install

```bash
cd mcp-server
npm install
```

## Run (dev)

```bash
npm run dev
```

## Run (built)

```bash
npm run build
npm start
```

## Configuration

| Env var | Default | Purpose |
|---------|---------|---------|
| `SHORTENER_API_BASE` | `http://localhost:5000` | Base URL of the Express backend |

## Tools

| Tool | Auth | Description |
|------|------|-------------|
| `register_user` | — | Create a new account |
| `login` | — | Log in (stores JWT in memory) |
| `logout` | — | Clear stored JWT |
| `whoami` | — | Show current session state |
| `shorten_url` | optional | Shorten a long URL |
| `get_my_links` | required | List the logged-in user's links |

The JWT from `login` is reused automatically by `shorten_url` (attaches the link to your account) and `get_my_links`.

## Use with Claude Desktop

Add to `claude_desktop_config.json`:

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

## Use with MCP Inspector

```bash
npx @anthropic-ai/mcp-inspector npx tsx src/index.ts
```
