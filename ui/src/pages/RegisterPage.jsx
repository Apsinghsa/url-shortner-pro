import React from "react";

export default function RegisterPage() {
  return (
    <>
      <div className="auth-container">
        <h2>Create Your Account</h2>;<p>Join Us</p>
        <form>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="text"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="text"
              placeholder="Choose a strong password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              id="password2"
              type="text"
              placeholder="Re-enter the password"
              required
            />
          </div>

          <button type="submit" className="btn">
            Register
          </button>
        </form>
        <p className="auth-switch">
          Already have an account ? {<a href="/login">Login instead</a>}
        </p>
      </div>
    </>
  );
}
