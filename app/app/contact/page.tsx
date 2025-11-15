"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, MapPin, Users, MessageCircle } from "lucide-react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import PageThemeToggle from "../../components/PageThemeToggle";
import Image from "next/image";
import { useTheme } from "../../components/ThemeProvider";

export default function ContactPage() {
  const { theme } = useTheme();
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
      await new Promise((r) => setTimeout(r, 800));
      setSending(false);
      setResult("success");
      setFirstName("");
      setLastName("");
      setEmail("");
      setMessage("");
    } catch {
      setSending(false);
      setResult("error");
    }
  };

  return (
    <DashboardPageLayout>
      <div className="flex justify-end mb-6">
        <PageThemeToggle />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden mb-12">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&auto=format&fit=crop"
            alt="Contact us"
            fill
            className="object-cover"
            priority
          />
          <div
            className={`absolute inset-0 ${
              theme === "dark"
                ? "bg-linear-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950"
                : "bg-linear-to-b from-white/60 via-orange-50/80 to-white"
            }`}
          />
        </div>

        <div className="relative z-10 w-full px-6 lg:px-12 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className={`inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border ${
                  theme === "dark"
                    ? "bg-lime-400/10 border-lime-400/20"
                    : "bg-emerald-100/80 border-emerald-300/50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    theme === "dark" ? "bg-lime-400" : "bg-emerald-600"
                  }`}
                />
                <span
                  className={`text-sm ${
                    theme === "dark" ? "text-lime-400" : "text-emerald-700"
                  }`}
                >
                  We&apos;re Here to Help
                </span>
              </motion.div>

              <h1
                className={`text-5xl lg:text-6xl font-bold mb-6 ${
                  theme === "dark" ? "text-white" : "text-neutral-900"
                }`}
              >
                Get in{" "}
                <span
                  className={
                    theme === "dark" ? "text-lime-400" : "text-emerald-600"
                  }
                >
                  Touch
                </span>
              </h1>

              <p
                className={`text-lg max-w-2xl mx-auto ${
                  theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                }`}
              >
                Have questions, suggestions, or want to contribute? We&apos;d
                love to hear from you. Send us a message and we&apos;ll respond
                within 24 hours.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section
        className={`py-12 px-6 lg:px-12 ${
          theme === "dark" ? "bg-neutral-950" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: Mail,
                title: "Email",
                info: "hello@roots.example",
                color: "blue",
              },
              {
                icon: Users,
                title: "Community",
                info: "Join our cultural community",
                color: "purple",
              },
              {
                icon: MapPin,
                title: "Location",
                info: "Global • Online-first",
                color: "orange",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`rounded-3xl border p-6 text-center ${
                  theme === "dark"
                    ? "bg-neutral-900 border-neutral-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <item.icon
                  className={`w-10 h-10 mx-auto mb-4 ${
                    item.color === "blue"
                      ? "text-blue-400"
                      : item.color === "purple"
                      ? "text-purple-400"
                      : "text-orange-400"
                  }`}
                />
                <h3
                  className={`font-semibold mb-2 ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {item.title}
                </h3>
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  {item.info}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div
              className={`rounded-3xl border p-8 lg:p-12 ${
                theme === "dark"
                  ? "bg-linear-to-br from-neutral-900 to-neutral-800 border-neutral-700"
                  : "bg-linear-to-br from-emerald-50 to-orange-50 border-emerald-200"
              }`}
            >
              <div className="text-center mb-8">
                <MessageCircle
                  className={`w-12 h-12 mx-auto mb-4 ${
                    theme === "dark" ? "text-lime-400" : "text-emerald-600"
                  }`}
                />
                <h2
                  className={`text-3xl font-bold mb-2 ${
                    theme === "dark" ? "text-white" : "text-neutral-900"
                  }`}
                >
                  Send us a message
                </h2>
                <p
                  className={`${
                    theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                  }`}
                >
                  Fill out the form below and we&apos;ll get back to you soon
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <label className="flex flex-col">
                    <span
                      className={`text-sm mb-2 font-medium ${
                        theme === "dark"
                          ? "text-neutral-300"
                          : "text-neutral-700"
                      }`}
                    >
                      First name *
                    </span>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`px-4 py-3 rounded-xl border outline-none transition-colors ${
                        theme === "dark"
                          ? "bg-neutral-800 border-neutral-700 text-white focus:border-lime-400"
                          : "bg-white border-neutral-200 text-neutral-900 focus:border-emerald-400"
                      }`}
                      type="text"
                      placeholder="John"
                      required
                    />
                  </label>

                  <label className="flex flex-col">
                    <span
                      className={`text-sm mb-2 font-medium ${
                        theme === "dark"
                          ? "text-neutral-300"
                          : "text-neutral-700"
                      }`}
                    >
                      Last name
                    </span>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`px-4 py-3 rounded-xl border outline-none transition-colors ${
                        theme === "dark"
                          ? "bg-neutral-800 border-neutral-700 text-white focus:border-lime-400"
                          : "bg-white border-neutral-200 text-neutral-900 focus:border-emerald-400"
                      }`}
                      type="text"
                      placeholder="Doe"
                    />
                  </label>
                </div>

                <label className="flex flex-col">
                  <span
                    className={`text-sm mb-2 font-medium ${
                      theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Email *
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`px-4 py-3 rounded-xl border outline-none transition-colors ${
                      theme === "dark"
                        ? "bg-neutral-800 border-neutral-700 text-white focus:border-lime-400"
                        : "bg-white border-neutral-200 text-neutral-900 focus:border-emerald-400"
                    }`}
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className="flex flex-col">
                  <span
                    className={`text-sm mb-2 font-medium ${
                      theme === "dark" ? "text-neutral-300" : "text-neutral-700"
                    }`}
                  >
                    Message *
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`px-4 py-3 rounded-xl border outline-none transition-colors min-h-40 ${
                      theme === "dark"
                        ? "bg-neutral-800 border-neutral-700 text-white focus:border-lime-400"
                        : "bg-white border-neutral-200 text-neutral-900 focus:border-emerald-400"
                    }`}
                    placeholder="Tell us how we can help you..."
                    required
                  />
                </label>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={{ scale: sending ? 1 : 1.05 }}
                    whileTap={{ scale: sending ? 1 : 0.95 }}
                    className={`px-8 py-3 rounded-full transition-colors flex items-center gap-2 ${
                      theme === "dark"
                        ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Send className="w-4 h-4" />
                    {sending ? "Sending..." : "Send message"}
                  </motion.button>

                  <div
                    className={`text-sm ${
                      theme === "dark" ? "text-neutral-400" : "text-neutral-600"
                    }`}
                  >
                    {result === "success" && (
                      <span
                        className={
                          theme === "dark"
                            ? "text-lime-400"
                            : "text-emerald-600"
                        }
                      >
                        ✓ Message sent — thanks!
                      </span>
                    )}
                    {result === "error" && (
                      <span className="text-red-500">
                        ✗ Error sending. Try again.
                      </span>
                    )}
                    {!result && <span>We respect your privacy</span>}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </DashboardPageLayout>
  );
}
