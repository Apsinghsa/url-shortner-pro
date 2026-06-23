import React, { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/authService";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.email) {
      errors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Email address is invalid.";
    }
    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    return errors;
  };

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const validationErrors = validate();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const response = await registerUser(formData);

      console.log("Registration successful:", response);
      setSuccess("Registration successful");

      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      const errorMessage =
        err.message || "Registration failed, Please try again";
      setServerError(errorMessage);
      console.error("Registration error:", err);
    }
    console.log("Registering with:", formData);
  }

  const inputBase =
    "w-full rounded-md border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary";
  const inputError = "border-danger focus:ring-danger";
  const inputOk = "border-gray-300";

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-1 text-sm text-gray-600">Join Us</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            onChange={handleChange}
            value={formData.name}
            required
            className={`${inputBase} ${
              formErrors.name ? inputError : inputOk
            }`}
          />
          {formErrors.name && (
            <p className="mt-1 text-xs text-danger">{formErrors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            onChange={handleChange}
            value={formData.email}
            required
            className={`${inputBase} ${
              formErrors.email ? inputError : inputOk
            }`}
          />
          {formErrors.email && (
            <p className="mt-1 text-xs text-danger">{formErrors.email}</p>
          )}
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
            name="password"
            type="password"
            placeholder="Choose a strong password"
            onChange={handleChange}
            value={formData.password}
            required
            className={`${inputBase} ${
              formErrors.password ? inputError : inputOk
            }`}
          />
          {formErrors.password && (
            <p className="mt-1 text-xs text-danger">{formErrors.password}</p>
          )}
        </div>

        {serverError && (
          <p className="text-center text-sm text-danger" role="alert">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-md bg-primary py-2 text-base font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Register
        </button>
      </form>

      {success && (
        <p className="mt-4 text-center text-sm text-success" role="status">
          {success}
        </p>
      )}

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-link hover:underline">
          Login instead
        </Link>
      </p>
    </div>
  );
}
