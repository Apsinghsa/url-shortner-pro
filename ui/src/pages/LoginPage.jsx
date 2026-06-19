import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Both email and password are required.");
      return;
    }

    try {
      const response = await loginUser(formData);

      if (response.token) {
        localStorage.setItem("token", response.token);
        console.log("Token stored in localStorage!");

        navigate("/dashboard");
      } else {
        setError("Login Successful, but no token provided!");
      }
    } catch (err) {
      const errorMessage = err.message || "Login failed, Please try again";
      setError(errorMessage);
      console.error("Login error:", err);
    }
  }

  return (
    <div className="auth-container">
      <h2>Welcome back!</h2>
      <p>Log in to access your dashboard</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            required
          />
        </div>

        <button type="submit" className="btn">
          Login
        </button>
      </form>
      {error && <p className="error-message text-red-700">{error}</p>}
      <p className="auth-switch">
        Don't have an account ? <Link to="/register">Register Now</Link>
      </p>
    </div>
  );
}
