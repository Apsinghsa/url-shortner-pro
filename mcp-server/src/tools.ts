import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  ApiError,
  getMyLinks,
  loginUser,
  registerUser,
  shortenUrl,
  type ShortUrl,
} from "./apiClient.js";
import { getEmail, getToken, setModuleSession } from "./authContext.js";

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function formatUrl(url: ShortUrl): string {
  return [
    `code: ${url.urlCode}`,
    `short: ${url.shortUrl}`,
    `long:  ${url.longUrl}`,
    `clicks: ${url.clickCount}`,
    `created: ${new Date(url.date).toISOString()}`,
  ].join("\n");
}

function handleApiError(err: unknown): ReturnType<typeof textResult> {
  if (err instanceof ApiError) {
    return textResult(`API error ${err.status}: ${err.message}`);
  }
  const msg = err instanceof Error ? err.message : String(err);
  return textResult(`Unexpected error: ${msg}`);
}

export function createServer() {
  const server = new McpServer({
    name: "shortly",
    version: "0.2.0",
  });

  server.registerTool(
    "register_user",
    {
      description:
        "Register a new account on the URL shortener. The backend returns a JWT in the same response, which is auto-stored in the local session (stdio) and printed in the response for hosted use.",
      inputSchema: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().optional(),
      }),
    },
    async ({ email, password, name }) => {
      try {
        const res = await registerUser({ email, password, name });
        setModuleSession(res.token, email);
        return textResult(
          `${res.message ?? "User registered"}\n` +
            `Auto-logged in as ${email} (stdio mode).\n` +
            `JWT: ${res.token}\n\n` +
            `For hosted MCP: paste this JWT into your client config under headers.Authorization.`,
        );
      } catch (err) {
        return handleApiError(err);
      }
    },
  );

  server.registerTool(
    "login",
    {
      description:
        "Log in to the URL shortener. Returns a JWT — paste it into your MCP client config as `Authorization: Bearer <token>` to authenticate subsequent calls.",
      inputSchema: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    },
    async ({ email, password }) => {
      try {
        const res = await loginUser({ email, password });
        setModuleSession(res.token, email);
        return textResult(
          `Logged in as ${email}\nJWT: ${res.token}\n\n` +
            `For hosted MCP: paste this JWT into your client config under headers.Authorization. ` +
            `For local stdio: the token is stored automatically for this session.`,
        );
      } catch (err) {
        return handleApiError(err);
      }
    },
  );

  server.registerTool(
    "logout",
    {
      description:
        "Clear the session (stdio mode only). For hosted MCP, simply remove the Authorization header.",
      inputSchema: z.object({}),
    },
    async () => {
      const { token, email } = { token: getToken(), email: getEmail() };
      if (!token) {
        return textResult("Not currently logged in");
      }
      setModuleSession(undefined, undefined);
      return textResult(`Logged out ${email ?? ""}`.trim());
    },
  );

  server.registerTool(
    "whoami",
    {
      description:
        "Show the current session state. Reads the Authorization header (HTTP) or in-memory session (stdio).",
      inputSchema: z.object({}),
    },
    async () => {
      const token = getToken();
      const email = getEmail();
      if (!token) {
        return textResult("Anonymous (not authenticated)");
      }
      return textResult(`Authenticated as ${email ?? "(unknown email)"}`);
    },
  );

  server.registerTool(
    "shorten_url",
    {
      description:
        "Create a short URL. If authenticated, the link is associated with the user's account.",
      inputSchema: z.object({
        longUrl: z
          .string()
          .url()
          .describe("The long URL to shorten, e.g. https://example.com/very/long"),
      }),
    },
    async ({ longUrl }) => {
      try {
        const res = await shortenUrl(longUrl, getToken());
        if (res.data?.url) {
          return textResult(formatUrl(res.data.url));
        }
        return textResult(res.message ?? "URL shortened (no payload returned)");
      } catch (err) {
        return handleApiError(err);
      }
    },
  );

  server.registerTool(
    "get_my_links",
    {
      description:
        "List the short URLs created by the currently authenticated user. Requires login.",
      inputSchema: z.object({}),
    },
    async () => {
      const token = getToken();
      if (!token) {
        return textResult(
          "Not authenticated. For hosted MCP, set Authorization: Bearer <jwt>. For stdio, call the `login` tool first.",
        );
      }
      try {
        const res = await getMyLinks(token);
        if (!res.data?.length) {
          return textResult("No links found for this user.");
        }
        return textResult(
          `${res.count} link(s):\n\n` + res.data.map(formatUrl).join("\n\n"),
        );
      } catch (err) {
        return handleApiError(err);
      }
    },
  );

  return server;
}
