"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useI18n } from "../hooks/useI18n";

export default function NewsletterSignup() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          data.message || "Successfully subscribed! Check your email."
        );
        setEmail("");
        setName("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to subscribe. Please try again later.");
      console.error("Newsletter subscription error:", error);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-900 border border-neutral-700/50 shadow-2xl"
      >
        {/* Animated background gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(132,204,22,0.05),transparent_60%)]" />

        <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
          {/* Left side - Content */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 w-fit mb-6"
            >
              <Sparkles className="w-4 h-4 text-lime-400" />
              <span className="text-xs font-semibold text-lime-400 uppercase tracking-wider">
                {t("newsletter.badge")}
              </span>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
            >
              <span className="text-white">{t("newsletter.title")}</span>
              <br />
              <span className="bg-linear-to-r from-lime-400 via-yellow-300 to-lime-400 bg-clip-text text-transparent">
                {t("newsletter.titleHighlight")}
              </span>
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-neutral-400 mb-6 text-base md:text-lg leading-relaxed"
            >
              {t("newsletter.subtitle")}
            </motion.p>

            {/* Features list */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="hidden md:flex flex-col gap-3 mb-6"
            >
              {[
                { icon: "🍳", text: t("newsletter.features.recipes") },
                { icon: "🎭", text: t("newsletter.features.stories") },
                { icon: "🎁", text: t("newsletter.features.exclusive") },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 text-sm text-neutral-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center shrink-0">
                    <span className="text-base">{feature.icon}</span>
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="hidden md:flex items-center gap-4 text-xs text-neutral-500"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-linear-to-br from-lime-400 to-yellow-500 border-2 border-neutral-900"
                  />
                ))}
              </div>
              <span>Join 10,000+ cultural explorers</span>
            </motion.div>
          </div>

          {/* Right side - Form */}
          <div className="flex flex-col justify-center">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl bg-linear-to-br from-lime-400/20 to-yellow-400/10 border border-lime-400/30 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-lime-400 flex items-center justify-center mb-4 shadow-lg shadow-lime-400/50">
                    <Check className="w-8 h-8 text-neutral-950" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2 text-white">
                    {t("newsletter.success.title")}
                  </h4>
                  <p className="text-neutral-300 leading-relaxed">{message}</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("newsletter.form.name")}
                      className="w-full px-5 py-4 rounded-xl bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("newsletter.form.email")}
                      required
                      className="w-full px-5 py-4 rounded-xl bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 text-white placeholder-neutral-500 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/20 transition-all"
                    />
                  </div>
                </div>

                {status === "error" && message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm"
                  >
                    {message}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-8 py-4 rounded-xl font-semibold text-neutral-950 bg-linear-to-r from-lime-400 to-yellow-300 hover:from-lime-300 hover:to-yellow-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-lime-400/30"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("newsletter.form.subscribing")}
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      {t("newsletter.form.subscribe")}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>

                <p className="text-xs text-neutral-500 text-center">
                  {t("newsletter.form.privacy")}
                </p>
              </motion.form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
