import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await registerUser(formData);

      console.log("Registration successful:", response);
      setSuccess("Registration successful");

      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      const errorMessage =
        err.message || "Registration failed, Please try again";
      setError(errorMessage);
      console.error("Registration error:", err);
    }
    console.log("Registering with:", formData);
  }

  return (
    <>
      <div className="auth-container">
        <h2>Create Your Account</h2>;<p>Join Us</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              onChange={handleChange}
              value={formData.name}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="text"
              placeholder="Enter your email"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="text"
              placeholder="Choose a strong password"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>

          <button type="submit" className="btn">
            Register
          </button>
        </form>
        {error && <p className="error-message text-red-700">{error}</p>}
        {success && <p className="success-message text-green-700">{success}</p>}
        <p className="auth-switch">
          Already have an account ? <Link to="/login">Login instead</Link>
        </p>
      </div>
    </>
  );
}
