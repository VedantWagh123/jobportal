import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { X, Sparkles, Crown, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumUnlockModal = () => {
    const { showPremiumPopup, setShowPremiumPopup } = useContext(AppContext);
    const navigate = useNavigate();

    const handleUnlockClick = () => {
        setShowPremiumPopup(false);
        navigate('/pricing');
        // Smooth scroll to top of pricing page
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    };

    return (
        <AnimatePresence>
            {showPremiumPopup && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPremiumPopup(false)}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto"
                    >
                        {/* Top Decorative Gradient */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 opacity-10 pointer-events-none"></div>
                        
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowPremiumPopup(false); }}
                            className="absolute top-4 right-4 p-2 bg-gray-50/50 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition z-50 cursor-pointer pointer-events-auto"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8 text-center relative z-10">
                            {/* Icon */}
                            <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-yellow-100 to-yellow-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-yellow-50 relative">
                                <Crown size={36} className="text-yellow-500 absolute" strokeWidth={2.5} />
                                <Sparkles size={16} className="text-yellow-400 absolute top-3 right-3 animate-pulse" />
                            </div>

                            {/* Text Content */}
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">
                                Unlock Lumi Power
                            </h2>
                            <p className="text-sm font-medium text-gray-500 mb-8 px-2 leading-relaxed">
                                You've discovered a premium feature! Upgrade your account to access our Lumi Resume Builder, Lumi SmartMatch, and more exclusive career tools.
                            </p>

                            {/* Features List */}
                            <div className="flex flex-col gap-3 text-left mb-8 px-4">
                                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Zap size={16} /></div>
                                    Unlimited AI Job Matches
                                </div>
                                <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Sparkles size={16} /></div>
                                    Auto Job Apply Assistant
                                </div>
                            </div>

                            {/* CTA Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleUnlockClick(); }}
                                className="w-full relative group overflow-hidden rounded-2xl p-[2px] mb-2 cursor-pointer pointer-events-auto z-50"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl animate-gradient-xy group-hover:scale-105 transition-transform duration-300"></span>
                                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 transition-colors py-4 px-6 rounded-2xl flex items-center justify-center gap-2">
                                    <span className="text-white font-black text-lg tracking-wide uppercase shadow-sm">Unlock Premium</span>
                                    <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                </div>
                            </button>
                            
                            <p className="text-xs text-gray-400 font-medium mt-3">Try Free for 7 Days • Cancel Anytime</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PremiumUnlockModal;
