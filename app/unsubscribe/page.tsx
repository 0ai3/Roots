"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email");
  
  const [email, setEmail] = useState(emailFromUrl || "");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Successfully unsubscribed from newsletter.");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to unsubscribe. Please try again later.");
      console.error("Newsletter unsubscribe error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 p-8">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-lime-400/5 rounded-full blur-3xl" />
          
          <div className="relative">
            {status === "success" ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-lime-400/10 border border-lime-400/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-lime-400" />
                </div>
                <h1 className="text-2xl font-bold mb-3 text-white">
                  Unsubscribed Successfully
                </h1>
                <p className="text-neutral-400 mb-6">
                  {message}
                </p>
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 rounded-xl font-semibold text-neutral-950 bg-lime-400 hover:bg-lime-300 transition-colors"
                  >
                    Return to Homepage
                  </motion.button>
                </Link>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-neutral-400" />
                </div>
                
                <h1 className="text-2xl font-bold mb-3 text-center text-white">
                  Unsubscribe from Newsletter
                </h1>
                
                <p className="text-neutral-400 mb-6 text-center">
                  We're sorry to see you go. Enter your email to unsubscribe from our newsletter.
                </p>

                <form onSubmit={handleUnsubscribe} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-5 py-4 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 transition-all"
                  />

                  {status === "error" && message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                    >
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{message}</p>
                    </motion.div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-8 py-4 rounded-xl font-semibold text-neutral-950 bg-lime-400 hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Unsubscribing...
                      </>
                    ) : (
                      "Unsubscribe"
                    )}
                  </motion.button>

                  <div className="text-center">
                    <Link href="/" className="text-sm text-neutral-400 hover:text-lime-400 transition-colors">
                      Changed your mind? Go back home
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-lime-400 animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
