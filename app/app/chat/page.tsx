"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Globe2,
  Languages,
  Book,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Users,
  Zap,
  Heart,
} from "lucide-react";
import DashboardPageLayout from "../../components/DashboardPageLayout";
import ChatInterface from "../../components/ChatInterface";
import Image from "next/image";

// Sample conversation starters
const conversationTopics = [
  {
    id: 1,
    title: "Cultural Traditions",
    description: "Learn about festivals, customs, and ceremonies",
    icon: Globe2,
    color: "blue",
  },
  {
    id: 2,
    title: "Language Learning",
    description: "Practice phrases and improve your language skills",
    icon: Languages,
    color: "purple",
  },
  {
    id: 3,
    title: "History & Heritage",
    description: "Explore historical events and cultural heritage",
    icon: Book,
    color: "orange",
  },
  {
    id: 4,
    title: "Local Cuisine",
    description: "Discover traditional recipes and cooking techniques",
    icon: Sparkles,
    color: "pink",
  },
];

function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=1920&auto=format&fit=crop"
          alt="Cultural conversation"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-neutral-950/80 via-neutral-950/70 to-neutral-950" />
      </div>

      <div className="relative z-10 w-full px-6 lg:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border bg-lime-400/10 border-lime-400/20">
              <div className="w-2 h-2 rounded-full bg-lime-400" />
              <span className="text-sm text-lime-400">
                AI-Powered Cultural Assistant
              </span>
            </motion.div>

            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-white">
              Chat About{" "}
              <span className="text-lime-400">Culture</span>
            </h1>

            <p className="text-lg mb-8 text-neutral-300">
              Have meaningful conversations about global cultures, traditions,
              languages, and heritage. Get instant answers, learn new phrases,
              and explore the world&apos;s cultural diversity through AI-powered
              dialogue.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                className="px-8 py-4 rounded-full flex items-center gap-2 bg-lime-400 text-neutral-950 hover:bg-lime-300 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle className="w-5 h-5" />
                Start Chatting
              </motion.button>

              <motion.button
                className="px-8 py-4 rounded-full backdrop-blur-sm border bg-neutral-800/50 text-white border-neutral-700 hover:bg-neutral-700/50 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-5 h-5" />
                View Examples
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    {
      label: "Conversations",
      value: "50K+",
      icon: MessageCircle,
      color: "blue",
    },
    { label: "Languages", value: "100+", icon: Languages, color: "purple" },
    { label: "Active Users", value: "10K+", icon: Users, color: "orange" },
    { label: "Response Time", value: "<1s", icon: Zap, color: "yellow" },
  ];

  return (
    <section className="py-16 px-6 lg:px-12 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-3xl border p-6 backdrop-blur bg-neutral-900 border-neutral-800"
            >
              <stat.icon
                className={`w-8 h-8 mb-3 ${
                  stat.color === "blue"
                    ? "text-blue-400"
                    : stat.color === "purple"
                    ? "text-purple-400"
                    : stat.color === "orange"
                    ? "text-orange-400"
                    : "text-yellow-400"
                }`}
              />
              <p className="text-3xl font-bold mb-1 text-white">
                {stat.value}
              </p>
              <p className="text-sm text-neutral-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TopicsSection() {
  return (
    <section className="py-24 px-6 lg:px-12 bg-neutral-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-4 py-2 rounded-full mb-4 bg-lime-400/10 text-lime-400">
            Popular Topics
          </div>
          <h2 className="text-4xl font-bold mb-4 text-white">
            What Would You Like to Explore?
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-400">
            Choose a topic to start your cultural journey or ask anything
            you&apos;re curious about
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {conversationTopics.map((topic, index) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl border p-6 transition-all h-full bg-neutral-900 border-neutral-800 hover:border-lime-400/30">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-lime-400/10 border border-lime-400/20">
                  <topic.icon
                    className={`w-7 h-7 ${
                      topic.color === "blue"
                        ? "text-blue-400"
                        : topic.color === "purple"
                        ? "text-purple-400"
                        : topic.color === "orange"
                        ? "text-orange-400"
                        : "text-pink-400"
                    }`}
                  />
                </div>

                <h3 className="text-xl font-bold mb-2 text-white">
                  {topic.title}
                </h3>

                <p className="text-sm mb-4 text-neutral-400">
                  {topic.description}
                </p>

                <motion.div className="flex items-center gap-2 text-sm font-semibold text-lime-400 group-hover:text-lime-300">
                  Ask about this
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: "Instant Responses",
      description: "Get immediate answers to all your cultural questions",
      icon: Zap,
    },
    {
      title: "Multi-Language Support",
      description: "Communicate in over 100 languages worldwide",
      icon: Languages,
    },
    {
      title: "Personalized Learning",
      description: "Tailored conversations based on your interests",
      icon: Heart,
    },
    {
      title: "Cultural Insights",
      description: "Deep dive into traditions, customs, and heritage",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4 text-white">
            Why Chat With Us?
          </h2>
          <p className="max-w-2xl mx-auto text-neutral-400">
            Experience the power of AI-driven cultural education
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="rounded-3xl border p-6 bg-neutral-900 border-neutral-800"
            >
              <feature.icon className="w-10 h-10 mb-4 text-lime-400" />
              <h3 className="text-lg font-bold mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ChatPage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <DashboardPageLayout>
      {/* Theme controlled by global ThemeToggle */}

      {!showChat ? (
        <>
          <HeroSection />
          <StatsSection />
          <TopicsSection />
          <FeaturesSection />

          {/* CTA to Chat Interface */}
          <section className="py-24 px-6 lg:px-12 bg-neutral-950">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border p-12 bg-linear-to-br from-neutral-900 to-neutral-800 border-neutral-700"
              >
                <MessageCircle
                  className="w-16 h-16 mx-auto mb-6 text-lime-400"
                />
                <h2 className="text-3xl font-bold mb-4 text-white">
                  Ready to Start Your Cultural Journey?
                </h2>
                <p className="text-lg mb-8 text-neutral-300">
                  Begin a conversation with our AI assistant and explore
                  cultures, traditions, and languages from around the world
                </p>
                <motion.button
                  onClick={() => setShowChat(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full flex items-center gap-2 mx-auto transition-colors bg-lime-400 text-neutral-950 hover:bg-lime-300"
                >
                  Open Chat Interface
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            </div>
          </section>
        </>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setShowChat(false)}
            className="flex items-center gap-2 text-sm font-medium text-lime-400 hover:text-lime-300"
          >
            ← Back to Overview
          </button>
          <ChatInterface />
        </div>
      )}
    </DashboardPageLayout>
  );
}
