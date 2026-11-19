
"use client";

import { useEffect, useState } from "react";
import { Wrench, ShieldCheck } from "lucide-react";

const loadingMessages = [
  "Preparing your repair experience...",
  "Connecting with trusted technicians...",
  "Getting everything ready...",
  "Almost there...",
];

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + 2));
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">

        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="rounded-xl bg-orange-600 p-3 text-white shadow-lg shadow-orange-200">
            <Wrench size={28} />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Fix<span className="text-orange-600">Mate</span>
          </h1>
        </div>

        {/* Animated Spinner */}
        <div className="relative mx-auto flex size-28 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-200 border-t-orange-600" />

          <div className="absolute inset-3 animate-spin rounded-full border-4 border-transparent border-b-orange-300 [animation-direction:reverse] [animation-duration:1.5s]" />

          <Wrench size={32} className="text-orange-600" />
        </div>

        {/* Loading Text */}
        <h2 className="mt-8 text-xl font-bold text-gray-900">
          Getting Things Ready
        </h2>

        <p
          key={messageIndex}
          className="mt-3 min-h-6 animate-pulse text-sm text-gray-500"
        >
          {loadingMessages[messageIndex]}
        </p>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="mb-2 flex justify-between text-xs font-medium text-gray-500">
            <span>Please wait</span>
            <span>{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-orange-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={15} className="text-green-600" />
          Reliable Repair. Trusted Technicians.
        </div>
      </div>
    </main>
  );
}
