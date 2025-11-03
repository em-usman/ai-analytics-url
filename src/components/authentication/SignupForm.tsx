"use client";
import React, { useState } from "react";
import { Label } from "../ui/FormUI/label"; // Assuming you have these UI components
import { Input } from "../ui/FormUI/input";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import GradientButton from "../ui/GradientButton"; // Assuming you have this
import authImage from "../../assets/auth_pic/auth_pic.webp";

// Import the API service function
import { registerUser } from "../../services/authServices";
// Import the types
import type { FormData } from "../../types";
import Spinner from "../ui/spinner";

declare global {
  interface Window {
    __ZUSTAND__?: {
      reset?: () => void;
    };
  }
}

export function SignupForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Email validation regex
  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Live email validation
    if (name === "email") {
      if (value === "") setEmailError("");
      else if (!validateEmail(value))
        setEmailError("Please enter a valid email address.");
      else setEmailError("");
    }

    // Live password + confirm password validation
    if (name === "password" || name === "confirmPassword") {
      const password = name === "password" ? value : formData.password;
      const confirmPassword =
        name === "confirmPassword" ? value : formData.confirmPassword;

      if (password.length > 0 && password.length < 8)
        setPasswordError("Password must be at least 8 characters long.");
      else if (confirmPassword && password !== confirmPassword)
        setPasswordError("Passwords do not match.");
      else setPasswordError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Final checks before submission
    if (emailError) return;
    if (passwordError) return;
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    // Call the API service
    const result = await registerUser({
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });

    setLoading(false);

    if (result.success) {
      // Clear any previous user data from localStorage and global state before redirect
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      window.localStorage.clear();
      if (window.__ZUSTAND__) window.__ZUSTAND__.reset?.();
      // On success, clear form and redirect
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      // Force reload global data for new user
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 100);
    } else {
      // Show the error from the backend (e.g., "EMAIL_EXISTS")
      setMessage(result.message || "Error creating account.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gray)] flex">
      {/* Form Container */}
      <div className="w-full max-w-lg p-8 bg-white shadow-lg min-h-screen flex flex-col justify-center">
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-3xl md:text-4xl font-bold">Get Started</h2>
          <p className="text-lg text-gray-600">
            Create your account and begin your journey
          </p>
        </div>

        {/* Error Message */}
        {message && (
          <p className="text-center mb-4 text-sm text-red-500">{message}</p>
        )}

        <form className="my-8" onSubmit={handleSubmit}>
          {/* Name */}
          <LabelInputContainer>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              type="text"
              required
            />
          </LabelInputContainer>

          {/* Email */}
          <LabelInputContainer className="mt-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              type="email"
              required
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </LabelInputContainer>

          {/* Password */}
          <LabelInputContainer className="mt-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              type="password"
              required
              className={passwordError ? "border-red-500" : ""}
            />
          </LabelInputContainer>

          {/* Confirm Password */}
          <LabelInputContainer className="mt-4 mb-6">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={passwordError ? "border-red-500" : ""}
            />
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </LabelInputContainer>

          {/* Submit */}
          <GradientButton
            type="submit"
            className="w-full bg-[var(--accent-active)] text-[var(--text-primary)] font-semibold text-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner
                  size="sm"
                  className="border-[var(--accent-active)] border-t-transparent"
                />
                Signing Up...
              </div>
            ) : (
              "Sign Up"
            )}
          </GradientButton>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign In
          </span>
        </p>
      </div>

      {/* Image Container */}
      <div className="hidden md:flex flex-1 items-center justify-center p-8 max-h-screen bg-gray-900">
        <img
          src={authImage}
          alt="Auth"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}

// Helper component for layout
const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
