"use client";

import React, { useState } from "react";
import Image from "next/image";
import Input from "../components/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login submitted:", { email, password });
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
      <div className="relative min-h-screen flex items-center justify-center px-[5vw] py-[5vh]">
        <div className="w-[90%] max-w-[28rem] bg-black/20 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-[clamp(1.5rem,4vw,2.5rem)] shadow-2xl">
          <div className="mb-[clamp(1.5rem,3vh,2rem)]">
            <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-semibold text-white mb-[0.5rem] text-center">
              Welcome back
            </h2>
            <p className="text-zinc-400 text-[clamp(0.875rem,1.5vw,1rem)] text-center">
              Sign in to access your dashboard
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-[clamp(1.25rem,2.5vh,1.5rem)]"
          >
            <div>
              <label className="block text-white text-[clamp(0.875rem,1.2vw,0.875rem)] font-medium mb-[0.5rem]">
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
              <label className="block text-white text-[clamp(0.875rem,1.2vw,0.875rem)] font-medium mb-[0.5rem]">
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

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-[0.875rem] rounded-lg transition-colors flex items-center justify-center gap-2"
            >
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
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
