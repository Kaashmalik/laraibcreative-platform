'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewsletterSection() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            toast.success('Welcome to the inner circle! 🌟');
            setEmail('');
            setLoading(false);
        }, 1500);
    };

    return (
        <section className="relative py-32 overflow-hidden flex items-center justify-center min-h-[600px]">
            {/* Parallax Background */}
            <div
                className="absolute inset-0 z-0 bg-fixed bg-center bg-cover"
                style={{
                    backgroundImage: "url('https://res.cloudinary.com/dupjniwgq/image/upload/v1766076752/laraibcreative/assets/newsletter_bg.jpg')"
                }}
            >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 backdrop-blur-md mb-8">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-200 text-xs font-bold tracking-widest uppercase">VIP Access Only</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-serif">
                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200">Inner Circle</span>
                    </h2>

                    <p className="text-lg text-gray-300 mb-10 leading-relaxed font-light">
                        Be the first to access exclusive bridal collections, private sales, and luxury styling tips. Where tradition meets modern elegance.
                    </p>

                    <form onSubmit={handleSubscribe} className="relative max-w-lg mx-auto">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 rounded-full opacity-50 bg-[length:200%_200%] animate-gradient-xy group-hover:opacity-75 blur transition-opacity duration-300" />
                            <div className="relative flex items-center bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 shadow-2xl">
                                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mr-4" />
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 text-sm sm:text-base py-3"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-3 bg-white text-gray-900 rounded-full font-bold text-sm sm:text-base hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 ml-2 disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Subscribe <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-gray-500">
                            By subscribing, you agree to our Privacy Policy. No spam, ever.
                        </p>
                    </form>
                </motion.div>
            </div>

            {/* Decorative Particles via CSS */}
            <style jsx global>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          animation: gradient-xy 3s ease infinite;
        }
      `}</style>
        </section>
    );
}
