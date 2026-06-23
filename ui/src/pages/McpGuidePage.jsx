import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HOSTED_MCP_URL = "https://shortly-mcp.onrender.com/mcp";

const McpGuidePage = () => {
  const { token, isAuthenticated } = useAuth();
  const [tokenRevealed, setTokenRevealed] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(null);

  const handleCopy = async (text, kind) => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === "token") {
        setTokenCopied(true);
        setTimeout(() => setTokenCopied(false), 2000);
      } else {
        setSnippetCopied(kind);
        setTimeout(() => setSnippetCopied(null), 2000);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const hostedSnippet = isAuthenticated
    ? JSON.stringify(
        {
          mcpServers: {
            shortly: {
              url: HOSTED_MCP_URL,
              headers: { Authorization: `Bearer ${token}` },
            },
          },
        },
        null,
        2,
      )
    : JSON.stringify(
        {
          mcpServers: {
            shortly: {
              url: HOSTED_MCP_URL,
              // For authenticated tools (get_my_links), also add:
              // headers: { Authorization: "Bearer <paste-token-here>" }
            },
          },
        },
        null,
        2,
      );

  const stdioSnippet = JSON.stringify(
    {
      mcpServers: {
        shortly: {
          command: "npx",
          args: ["tsx", "C:/path/to/url_shortner/mcp-server/src/index.ts"],
          env: { SHORTENER_API_BASE: "http://localhost:5000" },
        },
      },
    },
    null,
    2,
  );

  const inspectorCommand =
    "npx @anthropic-ai/mcp-inspector npx tsx C:/path/to/url_shortner/mcp-server/src/index.ts";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-gray-900">MCP Server</h2>
        <p className="mt-2 text-gray-600">
          Let AI agents use the URL shortener through the Model Context Protocol.
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900">Your API token</h3>
        {isAuthenticated ? (
          <>
            <p className="mt-2 text-sm text-gray-600">
              Use this JWT in the <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">Authorization: Bearer &lt;token&gt;</code> header
              of your MCP client to access your account's links.{" "}
              <span className="font-medium text-danger">
                Keep this token private — anyone with it can act on your behalf.
              </span>
            </p>

            <div className="mt-4 flex items-stretch gap-2">
              <code className="flex-1 overflow-x-auto rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">
                {tokenRevealed
                  ? token
                  : "•".repeat(48) + " (click Generate to reveal)"}
              </code>
              {tokenRevealed ? (
                <button
                  type="button"
                  onClick={() => handleCopy(token, "token")}
                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {tokenCopied ? "Copied!" : "Copy"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTokenRevealed(true)}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  Generate
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              <Link to="/login" className="font-medium text-link hover:underline">
                Log in
              </Link>{" "}
              or{" "}
              <Link to="/register" className="font-medium text-link hover:underline">
                register
              </Link>{" "}
              to get your personal API token. Shortening URLs works without a
              token — only the dashboard tools need authentication.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900">
          How to connect an MCP client
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Add the config below to your MCP client (e.g. Claude Desktop's{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">claude_desktop_config.json</code>)
          and restart it. Two transports are available.
        </p>

        <div className="mt-6 space-y-6">
          <div>
            <h4 className="text-base font-semibold text-gray-800">
              Option 1 — Hosted (HTTP)
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              Connect to the public MCP server. Works from any machine.
            </p>
            <div className="mt-3 flex items-stretch gap-2">
              <pre className="flex-1 overflow-x-auto rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">
                {hostedSnippet}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(hostedSnippet, "hosted")}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {snippetCopied === "hosted" ? "Copied!" : "Copy"}
              </button>
            </div>
            {!isAuthenticated && (
              <p className="mt-2 text-xs text-gray-500">
                The snippet above is anonymous (shortening only). Log in to get
                a snippet with your token pre-filled.
              </p>
            )}
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-800">
              Option 2 — Local (stdio)
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              Runs the MCP server as a local process. Best for development.
              Requires the backend to be running on{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">localhost:5000</code>.
            </p>
            <div className="mt-3 flex items-stretch gap-2">
              <pre className="flex-1 overflow-x-auto rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">
                {stdioSnippet}
              </pre>
              <button
                type="button"
                onClick={() => handleCopy(stdioSnippet, "stdio")}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {snippetCopied === "stdio" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-800">
              Test with MCP Inspector
            </h4>
            <p className="mt-1 text-sm text-gray-600">
              Spin up the official MCP testing UI to browse and call every tool
              interactively:
            </p>
            <div className="mt-3 flex items-stretch gap-2">
              <code className="flex-1 overflow-x-auto rounded-md border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-xs text-gray-800">
                {inspectorCommand}
              </code>
              <button
                type="button"
                onClick={() => handleCopy(inspectorCommand, "inspector")}
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {snippetCopied === "inspector" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900">Available tools</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-gray-700">
              <tr>
                <th className="border-b border-table-header py-2">Tool</th>
                <th className="border-b border-table-header py-2">Auth</th>
                <th className="border-b border-table-header py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-table-border text-gray-700">
              <tr>
                <td className="py-2 font-mono text-xs">register_user</td>
                <td className="py-2">—</td>
                <td className="py-2">Create a new account</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">login</td>
                <td className="py-2">—</td>
                <td className="py-2">Get a fresh JWT</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">shorten_url</td>
                <td className="py-2">optional</td>
                <td className="py-2">Shorten a long URL</td>
              </tr>
              <tr>
                <td className="py-2 font-mono text-xs">get_my_links</td>
                <td className="py-2">required</td>
                <td className="py-2">List the user's links</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default McpGuidePage;
