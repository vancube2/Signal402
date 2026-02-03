"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORMS = {
  Polymarket: "🟣 Polymarket",
  Kalshi: "🔘 Kalshi",
  Solflare: "☀️ Solflare",
};

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ChatRoom } from "@/components/ChatRoom";
import { MessageSquare, X } from "lucide-react";

export default function SignalDashboard() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  React.useEffect(() => {
    async function fetchSignals() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signals`);
        const data = await res.json();
        setSignals(data);
      } catch (err) {
        console.error("Failed to fetch signals", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSignals();
  }, []);

  const handleReveal = async (signalId: string, priceLamports: number) => {
    if (!publicKey) {
      alert("Please connect your Solana wallet first!");
      return;
    }

    setRevealingId(signalId);
    try {
      // 1. Create a transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(process.env.NEXT_PUBLIC_VAULT_ADDRESS || ""),
          lamports: priceLamports,
        })
      );

      // 2. Send transaction
      const signature = await sendTransaction(transaction, connection);

      // 3. Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      // 4. Fetch the unlocked alpha from backend with the signature as proof
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reveal/${signalId}`, {
        method: 'POST',
        headers: {
          'X-402-Payment-Proof': signature,
        },
      });

      const data = await response.json();

      if (data.alpha_reasoning) {
        // Update the signal in the UI with the decrypted alpha
        setSignals(prev => prev.map(s =>
          s.id === signalId ? { ...s, alpha_analysis: data.alpha_reasoning, is_locked: false } : s
        ));
      } else {
        alert("Payment verified, but failed to retrieve alpha: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Payment failed", err);
      alert("Transaction failed: " + err.message);
    } finally {
      setRevealingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-white font-sans selection:bg-blue-500/30">
      {/* Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">
              S
            </div>
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              SIGNAL402
            </span>
          </div>
          <nav className="flex items-center gap-8">
            <a href="#" className="text-white/40 hover:text-white transition-colors">Signals</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Markets</a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">Documentation</a>
            <WalletMultiButton />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase mb-6 inline-block">
            Powered by Gemini 3 Pro
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight">
            Institutional AI Alpha <br />
            <span className="text-white/40">for Prediction Markets</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Signal402 analyzes global liquidity and macro sentiment to deliver high-probability market shifts. Gated by Solana x402 micropayments.
          </p>
        </motion.div>
      </section>

      {/* Signal Grid */}
      <section className="px-6 max-w-7xl mx-auto pb-32">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Active Alpha Signals</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">Latest</button>
            <button className="px-4 py-2 text-white/40 text-sm hover:text-white transition-colors">Trending</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-white/20 animate-pulse">
              Fetching Institutional Alpha Signals...
            </div>
          ) : (
            <AnimatePresence>
              {signals.map((signal) => (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="group relative bg-[#121624] border border-white/5 hover:border-blue-500/30 p-6 rounded-3xl transition-all duration-300"
                >
                  {/* Platform Badge */}
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-4 flex justify-between items-center">
                    <span>{PLATFORMS[signal.platform as keyof typeof PLATFORMS] || signal.platform}</span>
                    <span className="text-emerald-400">Live</span>
                  </div>

                  <h3 className="text-xl font-bold mb-6 leading-snug group-hover:text-blue-400 transition-colors">
                    {signal.title}
                  </h3>

                  {/* Probability Meter */}
                  <div className="mb-8">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs text-white/40 font-bold uppercase">AI Win Probability</span>
                      <span className="text-2xl font-black text-blue-500">{signal.win_probability}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${signal.win_probability}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      />
                    </div>
                  </div>

                  {/* Opinion Tally */}
                  <div className="flex items-center gap-4 mb-6">
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all group/vote">
                      <span className="text-emerald-500 group-hover/vote:scale-110 transition-transform">▲</span>
                      <span className="text-xs font-bold text-white/40 group-hover/vote:text-emerald-400">{signal.community_up || 0}</span>
                    </button>
                    <button className="flex items-center gap-2 bg-white/5 hover:bg-rose-500/20 border border-white/5 hover:border-rose-500/30 px-3 py-1.5 rounded-xl transition-all group/vote">
                      <span className="text-rose-500 group-hover/vote:scale-110 transition-transform">▼</span>
                      <span className="text-xs font-bold text-white/40 group-hover/vote:text-rose-400">{signal.community_down || 0}</span>
                    </button>
                    <div className="flex-1 text-right">
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Consensus: </span>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Bullish</span>
                    </div>
                  </div>

                  {/* Action Area */}
                  <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Fee to Unlock</div>
                      <div className="font-bold text-lg">${(signal.micropayment_price / 1000000).toFixed(2)} <span className="text-white/20 text-sm">USDC</span></div>
                    </div>
                    <button
                      onClick={() => handleReveal(signal.id, signal.micropayment_price)}
                      disabled={revealingId === signal.id}
                      className="relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                    >
                      {revealingId === signal.id ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Processing
                        </span>
                      ) : (
                        "Reveal Alpha"
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Chat Room */}
      <ChatRoom isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Chat Toggle */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed right-6 bottom-6 w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center transition-all active:scale-95 z-40 group"
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        <span className="absolute right-0 top-0 w-3 h-3 bg-emerald-500 border-2 border-[#0B0F1A] rounded-full" />

        {/* Tooltip */}
        <div className="absolute right-16 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Community Chat
        </div>
      </button>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-white/20 text-xs font-medium uppercase tracking-[0.2em]">
        © 2026 Signal402 • Protocol Layer Optimized • Non-Custodial
      </footer>
    </main>
  );
}
