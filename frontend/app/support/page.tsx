"use client";

import React, { useState } from "react";
import {
  LifeBuoy,
  Search,
  MessageCircle,
  BookOpen,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const SupportSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SupportValues = z.infer<typeof SupportSchema>;

const FAQS = [
  {
    q: "How do I connect my Freighter wallet?",
    a: "Install the Freighter browser extension, switch it to Testnet, then click 'Connect Wallet' on the dashboard. Ensure NEXT_PUBLIC_STELLAR_NETWORK=testnet in your .env.local.",
  },
  {
    q: "Why is my deposit not showing?",
    a: "On-chain confirmations can take up to 30 seconds. If it still doesn't appear after 2 minutes, check the Transactions page or the Stellar testnet explorer.",
  },
  {
    q: "How is interest calculated?",
    a: "Interest accrues continuously based on the APY of your chosen savings product. It is compounded daily and credited to your balance automatically.",
  },
  {
    q: "Can I withdraw from a locked savings pool early?",
    a: "Early withdrawal is not permitted for locked pools. You must wait until the lock period expires. Flexible pools allow withdrawal at any time.",
  },
  {
    q: "How do referral rewards work?",
    a: "Share your referral link. When a friend deposits at least $100, you both receive $12 USDC credited to your wallets within 24 hours.",
  },
];

const VIDEOS = [
  { title: "Getting Started with Nestera", duration: "3:42" },
  { title: "Creating Your First Savings Goal", duration: "5:10" },
  { title: "Understanding Governance Voting", duration: "4:28" },
  { title: "How to Stake XLM", duration: "2:55" },
];

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupportValues>({
    resolver: zodResolver(SupportSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = async (data: SupportValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Support request sent:", data);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#061218] text-white px-4 py-10 md:px-12 lg:px-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#063d3d] to-[#0a6f6f] flex items-center justify-center text-[#5de0e0]">
          <LifeBuoy size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white m-0">Help &amp; Support</h1>
          <p className="text-[#5e8c96] text-sm m-0">Find answers or get in touch</p>
        </div>
      </div>

      {/* Knowledge base search */}
      <div className="relative mb-10 max-w-xl">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4a7080]"
        />
        <input
          type="search"
          placeholder="Search knowledge base…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-[#4a7080] focus:outline-none focus:border-cyan-500/40"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        {/* FAQ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-cyan-400" />
            <h2 className="text-base font-semibold text-white m-0">Common Issues</h2>
          </div>
          <div className="flex flex-col gap-2">
            {filteredFaqs.length === 0 && (
              <p className="text-[#5e8c96] text-sm">
                No results for &quot;{search}&quot;.
              </p>
            )}
            {filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-[rgba(8,120,120,0.12)] bg-gradient-to-b from-[rgba(6,18,20,0.55)] to-[rgba(4,12,14,0.45)] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-white cursor-pointer bg-transparent border-0"
                >
                  {faq.q}
                  {openFaq === i ? (
                    <ChevronUp size={15} className="text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown size={15} className="text-[#4a7080] shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <p className="px-4 pb-4 text-sm text-[#7aacb5] m-0">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={16} className="text-cyan-400" />
            <h2 className="text-base font-semibold text-white m-0">Contact Us</h2>
          </div>
          <div className="rounded-2xl border border-[rgba(8,120,120,0.12)] bg-gradient-to-b from-[rgba(6,18,20,0.55)] to-[rgba(4,12,14,0.45)] p-5">
            {sent ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                  <Send size={22} />
                </div>
                <p className="text-white font-semibold m-0">Message sent!</p>
                <p className="text-[#5e8c96] text-sm text-center m-0">
                  We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-cyan-400 text-sm font-medium mt-2 hover:underline cursor-pointer bg-transparent border-0"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
                noValidate
              >
                <div>
                  <label htmlFor="name" className="text-xs text-[#5e8c96] mb-1 block">
                    Name
                  </label>
                  <input
                    {...register("name")}
                    id="name"
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-[#4a7080] focus:outline-none focus:border-cyan-500/40 ${
                      errors.name ? "border-red-500/50" : "border-white/10"
                    }`}
                    placeholder="Your name"
                    aria-invalid={errors.name ? "true" : "false"}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="text-xs text-[#5e8c96] mb-1 block">
                    Email
                  </label>
                  <input
                    {...register("email")}
                    id="email"
                    type="email"
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-[#4a7080] focus:outline-none focus:border-cyan-500/40 ${
                      errors.email ? "border-red-500/50" : "border-white/10"
                    }`}
                    placeholder="you@example.com"
                    aria-invalid={errors.email ? "true" : "false"}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="text-xs text-[#5e8c96] mb-1 block"
                  >
                    Message
                  </label>
                  <textarea
                    {...register("message")}
                    id="message"
                    rows={4}
                    className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border text-sm text-white placeholder-[#4a7080] focus:outline-none focus:border-cyan-500/40 resize-none ${
                      errors.message ? "border-red-500/50" : "border-white/10"
                    }`}
                    placeholder="Describe your issue…"
                    aria-invalid={errors.message ? "true" : "false"}
                    disabled={isSubmitting}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-semibold hover:bg-cyan-500/30 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={14} />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Video tutorials */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <PlayCircle size={16} className="text-cyan-400" />
          <h2 className="text-base font-semibold text-white m-0">Video Tutorials</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VIDEOS.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-[rgba(8,120,120,0.12)] bg-gradient-to-b from-[rgba(6,18,20,0.55)] to-[rgba(4,12,14,0.45)] p-4 flex flex-col gap-3 cursor-pointer hover:border-cyan-500/25 transition-colors group"
            >
              <div className="w-full h-20 rounded-xl bg-white/5 flex items-center justify-center">
                <PlayCircle
                  size={28}
                  className="text-cyan-400 group-hover:text-cyan-300 transition-colors"
                />
              </div>
              <p className="text-sm font-medium text-white m-0">{v.title}</p>
              <p className="text-xs text-[#4a7080] m-0">{v.duration}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
