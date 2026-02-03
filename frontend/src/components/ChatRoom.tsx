'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, MessageSquare, X } from 'lucide-react';

interface Message {
    id: string;
    user: string;
    text: string;
    time: string;
    isAI?: boolean;
}

export const ChatRoom = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', user: 'AlphaWhale', text: 'Polymarket odds on ETH are lagging. $10k is programmed.', time: '12:44' },
        { id: '2', user: 'SolanaIntern', text: 'Just confirmed the x402 reveal. The depth analysis is insane.', time: '12:45' },
        { id: '3', user: 'SignalBot', text: 'New Signal Detected: Super Bowl LIX odds shifting +4.2%', time: '12:46', isAI: true },
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            user: 'You',
            text: input,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages([...messages, newMessage]);
        setInput('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 300 }}
                    className="fixed right-6 bottom-6 top-24 w-80 md:w-96 bg-[#0B0F1A] border border-white/10 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold tracking-widest text-white/60 uppercase">Shadow Chat</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[10px] text-white/30 font-bold">
                                <Users size={12} />
                                <span>1,242 Online</span>
                            </div>
                            <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
                    >
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${msg.isAI ? 'text-blue-400' : 'text-white/40'}`}>
                                        {msg.user}
                                    </span>
                                    <span className="text-[9px] text-white/10 font-bold">{msg.time}</span>
                                </div>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.user === 'You'
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : msg.isAI
                                            ? 'bg-blue-500/10 border border-blue-500/20 text-blue-100 rounded-tl-none'
                                            : 'bg-white/5 text-white/80 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white/5 border-t border-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Air your opinion..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
