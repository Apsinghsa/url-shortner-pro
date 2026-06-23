import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const { login } = useAuth();

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
        login(response.token);
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

  const inputClass =
    "w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
        <p className="mt-1 text-sm text-gray-600">
          Log in to access your dashboard
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            name="email"
            onChange={handleChange}
            value={formData.email}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            name="password"
            onChange={handleChange}
            value={formData.password}
            required
            className={inputClass}
          />
        </div>

        {error && (
          <p className="text-center text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-primary py-2 text-base font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-link hover:underline">
          Register Now
        </Link>
      </p>
    </div>
  );
}
