"use client";

import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push("/home");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-6">

      {/* Animated floating circles */}
      <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-10 right-10 animate-pulse" />

      {/* Main Card */}
      <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 max-w-xl w-full text-center animate-fadeIn">

        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-slideUp">
          Tars Chat
        </h1>

        <p className="text-gray-600 mb-10 text-lg animate-slideUp delay-150">
          Sign Up and Start Real-time messaging with Friends 
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slideUp delay-300">

          <SignInButton mode="modal">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:scale-105 transition-all duration-300 shadow-md">
              Sign In
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-sm">
              Sign Up
            </button>
          </SignUpButton>

        </div>

      </div>
    </div>
  );
}