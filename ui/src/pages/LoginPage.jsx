import React from "react";

export default function LoginPage() {
  return (
    <div className="auth-container">
      <h2>Welcome back!</h2>
      <p>Log in to access your dashboard</p>
      <form>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="btn">
          Login
        </button>
      </form>
      <p className="auth-switch">
        Don't have an account ? {<a href="/register">Register</a>}
      </p>
    </div>
  );
}
