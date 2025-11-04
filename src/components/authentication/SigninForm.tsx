"use client";
import React, { useState } from "react";
import { Label } from "../ui/FormUI/label";
import { Input } from "../ui/FormUI/input";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";
import GradientButton from "../ui/GradientButton";
import type { LoginData } from "../../types";
import { loginUser } from "../../services/authServices";
import authImage from "../../assets/auth_pic/auth_pic.webp";
import Spinner from "../ui/spinner";
import logo from "../../../public/logo.png";

export function SigninForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  // handle input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    // basic frontend validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    // Clear any previous user data from localStorage and global state before login
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    window.localStorage.clear();
    if (window.__ZUSTAND__) window.__ZUSTAND__.reset?.();

    const result = await loginUser(formData);
    setLoading(false);

    if (result.success) {
      // Reset global state to ensure fresh data
      if (window.__ZUSTAND__) window.__ZUSTAND__.reset?.();
      // Force reload global data for new user
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 100);
    } else {
      setMessage(result.message || "Login failed. Please try again.");
    }
  };
  return (
    <div className="min-h-screen bg-[var(--gray)] flex">
      <div className="w-full max-w-lg p-8 bg-white shadow-lg min-h-screen flex flex-col justify-center">
        <div className="text-center space-y-3 mb-8">
          <div className="relative">
            <img
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight"
              src={logo}
            />

            {/* Subtle underline accent */}
            {/* <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full"></div> */}
          </div>

          <p className="text-base md:text-lg text-gray-600 font-medium max-w-sm mx-auto leading-relaxed">
            Sign in to continue your journey with us
          </p>

          {/* Optional: Sparkle animation dots */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
        {message && (
          <p className="text-center mb-4 text-sm text-red-500">{message}</p>
        )}

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              type="email"
              required
            />
          </LabelInputContainer>

          <LabelInputContainer className="mt-4 mb-6">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              type="password"
              required
            />
          </LabelInputContainer>

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
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </GradientButton>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don't have an account. Please{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
      {/* Image Container - Hidden on small screens, covers the rest on md+ */}
      <div className="hidden md:flex flex-1 items-center justify-center p-8 max-h-screen bg-gray-900">
        <img
          src={authImage}
          alt="Login"
          className="max-w-full max-h-full object-contain md:object-cover "
        />
      </div>
    </div>
  );
}

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
