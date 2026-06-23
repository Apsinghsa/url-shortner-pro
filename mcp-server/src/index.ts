import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  ApiError,
  getMyLinks,
  loginUser,
  registerUser,
  shortenUrl,
  type ShortUrl,
} from "./apiClient.js";

let token: string | undefined;
let loggedInEmail: string | undefined;

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

const server = new McpServer({
  name: "shortly",
  version: "0.1.0",
});

server.registerTool(
  "register_user",
  {
    description:
      "Register a new account on the URL shortener. Returns success/failure; does not log in automatically.",
    inputSchema: z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().optional(),
    }),
  },
  async ({ email, password, name }) => {
    try {
      const res = await registerUser({ email, password, name });
      return textResult(res.message ?? "User registered");
    } catch (err) {
      return handleApiError(err);
    }
  },
);

server.registerTool(
  "login",
  {
    description:
      "Log in to the URL shortener. Stores the JWT in memory for subsequent authenticated calls.",
    inputSchema: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  },
  async ({ email, password }) => {
    try {
      const res = await loginUser({ email, password });
      token = res.token;
      loggedInEmail = email;
      return textResult(`Logged in as ${email}`);
    } catch (err) {
      return handleApiError(err);
    }
  },
);

server.registerTool(
  "logout",
  {
    description: "Clear the in-memory JWT and forget the current session.",
    inputSchema: z.object({}),
  },
  async () => {
    if (!token) {
      return textResult("Not currently logged in");
    }
    const email = loggedInEmail;
    token = undefined;
    loggedInEmail = undefined;
    return textResult(`Logged out ${email ?? ""}`.trim());
  },
);

server.registerTool(
  "whoami",
  {
    description:
      "Show the current session state (logged in / anonymous, with email if known).",
    inputSchema: z.object({}),
  },
  async () => {
    if (!token) {
      return textResult("Anonymous (not logged in)");
    }
    return textResult(`Logged in as ${loggedInEmail ?? "(unknown email)"}`);
  },
);

server.registerTool(
  "shorten_url",
  {
    description:
      "Create a short URL. If logged in, the link is associated with the user's account.",
    inputSchema: z.object({
      longUrl: z
        .string()
        .url()
        .describe("The long URL to shorten, e.g. https://example.com/very/long"),
    }),
  },
  async ({ longUrl }) => {
    try {
      const res = await shortenUrl(longUrl, token);
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
      "List the short URLs created by the currently logged-in user. Requires login.",
    inputSchema: z.object({}),
  },
  async () => {
    if (!token) {
      return textResult("Not logged in. Call the `login` tool first.");
    }
    try {
      const res = await getMyLinks(token);
      if (!res.data?.length) {
        return textResult("No links found for this user.");
      }
      return textResult(
        `${res.count} link(s):\n\n` +
          res.data.map(formatUrl).join("\n\n"),
      );
    } catch (err) {
      return handleApiError(err);
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("shortly-mcp running on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting shortly-mcp:", err);
  process.exit(1);
});
