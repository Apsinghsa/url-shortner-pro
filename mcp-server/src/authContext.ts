import { AsyncLocalStorage } from "node:async_hooks";

export interface AuthContext {
  token?: string;
}

// Per-request token, set by the HTTP transport from the Authorization header.
export const authStorage = new AsyncLocalStorage<AuthContext>();

// Module-level session for the stdio transport — `login` writes here so
// subsequent tool calls in the same process can use it. Email is only known
// for stdio logins (we don't decode the JWT on the HTTP path).
let moduleToken: string | undefined;
let moduleEmail: string | undefined;

export function setModuleSession(token: string | undefined, email: string | undefined) {
  moduleToken = token;
  moduleEmail = email;
}

export function getToken(): string | undefined {
  return authStorage.getStore()?.token ?? moduleToken;
}

export function getEmail(): string | undefined {
  return moduleEmail;
}
