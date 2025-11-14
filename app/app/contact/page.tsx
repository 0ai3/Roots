"use client";
import Navbar from "@/app/components/Navbar";
import React, { useState } from "react";

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<null | "success" | "error">(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setResult(null);

    try {
      // Replace with a real API call if available
      await new Promise((r) => setTimeout(r, 800));
      setSending(false);
      setResult("success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setSending(false);
      setResult("error");
    }
  };

  return (
    <>
    <Navbar scrollY={0} theme={"dark"}/>
    <main className="min-h-screen bg-white dark:bg-neutral-950 py-16">
      <section className="relative py-12 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-12 shadow-lg border transition-all bg-white/90 dark:bg-neutral-900/90 border-neutral-200 dark:border-neutral-800">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div>
                <h1 className="text-3xl font-semibold mb-4 text-neutral-900 dark:text-white">
                  Get in touch
                </h1>
                <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                  Have questions, suggestions or want to contribute? Send us a
                  message and our team will get back to you within a few
                  business days.
                </p>

                <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
                  <div>
                    <div className="font-medium">Email</div>
                    <div>hello@roots.example</div>
                  </div>
                  <div>
                    <div className="font-medium">Community</div>
                    <div>Join our community to share cultural insights</div>
                  </div>
                  <div>
                    <div className="font-medium">Location</div>
                    <div>Global • Online-first</div>
                  </div>
                </div>
              </div>

              <form className="space-y-4 w-full" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col">
                    <span className="text-sm mb-1 text-neutral-700 dark:text-neutral-300">
                      First name
                    </span>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="px-4 py-3 rounded-lg border outline-none bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                      type="text"
                      name="firstName"
                      placeholder="Your first name"
                      required
                    />
                  </label>

                  <label className="flex flex-col">
                    <span className="text-sm mb-1 text-neutral-700 dark:text-neutral-300">
                      Last name
                    </span>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="px-4 py-3 rounded-lg border outline-none bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                      type="text"
                      name="lastName"
                      placeholder="Your last name"
                    />
                  </label>
                </div>

                <label className="flex flex-col">
                  <span className="text-sm mb-1 text-neutral-700 dark:text-neutral-300">
                    Email
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-4 py-3 rounded-lg border outline-none bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                    type="email"
                    name="email"
                    placeholder="you@domain.com"
                    required
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm mb-1 text-neutral-700 dark:text-neutral-300">
                    Message
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="px-4 py-3 rounded-lg border outline-none bg-white/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white min-h-[140px]"
                    name="message"
                    placeholder="How can we help you?"
                    required
                  />
                </label>

                <div className="flex items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={sending}
                    className={`px-6 py-3 rounded-full text-black ${
                      sending
                        ? "bg-lime-400"
                        : "bg-lime-400 hover:bg-lime-500"
                    }`}
                  >
                    {sending ? "Sending..." : "Send message"}
                  </button>

                  <div className="text-sm text-neutral-500 dark:text-neutral-400">
                    {result === "success" && (
                      <span className="text-lime-500">
                        Message sent — thanks!
                      </span>
                    )}
                    {result === "error" && (
                      <span className="text-red-500">
                        There was an error. Try again.
                      </span>
                    )}
                    {!result && <span>We respect your privacy.</span>}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
