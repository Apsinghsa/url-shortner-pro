import "dotenv/config";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ApiError, loginUser, registerUser } from "./apiClient.js";
import { authStorage } from "./authContext.js";
import { createServer } from "./tools.js";

function parseBearer(header: string | undefined): string | undefined {
  if (!header) return undefined;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : undefined;
}

const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", name: "shortly-mcp", version: "0.2.0" });
});

// Auth-setup endpoints: one-time use to get a JWT for the hosted MCP.
// These mirror the backend's /api/auth/register and /api/auth/login but
// live on the MCP server so the user has a single URL to remember.
app.post("/register", async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }
  try {
    const result = await registerUser({ email, password, name });
    res.status(201).json(result);
  } catch (err) {
    forwardApiError(res, err);
  }
});

app.post("/token", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }
  try {
    const result = await loginUser({ email, password });
    res.json(result);
  } catch (err) {
    forwardApiError(res, err);
  }
});

function forwardApiError(res: express.Response, err: unknown) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error("Auth setup error:", err);
  return res.status(500).json({ error: "Internal server error" });
}

app.post("/mcp", async (req, res) => {
  const token = parseBearer(req.header("authorization"));
  // In stateless mode, McpServer can only handle one request — create a
  // fresh instance per call. Shared state lives in tool implementations
  // (authStorage for HTTP, module-level token for stdio).
  const mcpServer = createServer();
  try {
    await authStorage.run({ token }, async () => {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // stateless
      });
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        transport.close();
        mcpServer.close();
      });
    });
  } catch (err) {
    console.error("MCP request error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

const methodNotAllowed = (_req: express.Request, res: express.Response) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
};
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.error(`shortly-mcp HTTP listening on :${port}/mcp`);
});

