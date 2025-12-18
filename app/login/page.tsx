"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Input from "../components/Input";
import { useScreenSize, getResponsiveValues } from "../hooks/useScreenSize";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Measure screen size and get all responsive values
  const { width, height } = useScreenSize();
  const { padding, fontSize, card, spacing, margin } = getResponsiveValues(width, height);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/owner");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push("/owner");
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Logo Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/img/logo.jpg"
          alt="Lush & Co Background"
          fill
          className="object-cover opacity-40"
          priority
        />
      </div>

      {/* Centered Login Form */}
      <div
        className="relative min-h-screen flex items-center justify-center"
        style={{
          paddingLeft: `${padding.horizontal}px`,
          paddingRight: `${padding.horizontal}px`,
          paddingTop: `${padding.vertical}px`,
          paddingBottom: `${padding.vertical}px`,
        }}
      >
        <div
          className="w-[90%] max-w-[28rem] bg-black/20 backdrop-blur-sm border border-zinc-700/50 rounded-2xl shadow-2xl"
          style={{
            padding: `${card.padding}px`,
          }}
        >
          <div style={{ marginBottom: `${margin.bottom}px` }}>
            <h2
              className="font-semibold text-white text-center"
              style={{
                fontSize: `${fontSize.heading}px`,
                marginBottom: '8px'
              }}
            >
              Welcome back
            </h2>
            <p
              className="text-zinc-400 text-center"
              style={{ fontSize: `${fontSize.body}px` }}
            >
              Sign in to access your dashboard
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${spacing.vertical}px`
            }}
          >
            <div>
              <label
                className="block text-white font-medium"
                style={{
                  fontSize: `${fontSize.label}px`,
                  marginBottom: '8px'
                }}
              >
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                }
              />
            </div>

            <div>
              <label
                className="block text-white font-medium"
                style={{
                  fontSize: `${fontSize.label}px`,
                  marginBottom: '8px'
                }}
              >
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                }
              />
            </div>

            {error && (
              <div
                className="bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg"
                style={{
                  padding: '12px',
                  fontSize: `${fontSize.body}px`
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ padding: '14px' }}
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
}
