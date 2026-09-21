import React, { useEffect, useState, useContext } from 'react';
import { 
  Check, X, ArrowRight, ShieldCheck, Zap, Target, Star, 
  Lock, Clock, GraduationCap, Award, Crown, ChevronDown, Plus, Minus, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useUser } from '@clerk/clerk-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Pricing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const { backendUrl, setIsPremium } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const initPayment = async (options) => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      toast.error(response.error.description || 'Payment Failed');
      setIsProcessing(false);
    });
    rzp.open();
  };

  const handlePremiumPayment = async () => {
    if (!isLoaded) return;
    if (!user) {
      toast.info("Please login to upgrade.");
      return;
    }
    try {
      setIsProcessing(true);
      const token = await getToken();
      const { data } = await axios.post(`${backendUrl}/api/payments/create-order`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key',
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'InsiderJobs',
          description: 'Lifetime Premium Access',
          order_id: data.order.id,
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(`${backendUrl}/api/payments/verify-payment`, response, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (verifyRes.data.success) {
                setIsPremium(true);
                toast.success("Welcome to Premium! All features unlocked.");
              } else {
                toast.error("Payment Verification Failed.");
              }
            } catch (err) {
              toast.error("An error occurred during verification.");
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: { email: user.primaryEmailAddress?.emailAddress, name: user.fullName },
          theme: { color: '#facc15' } // Yellow theme
        };
        initPayment(options);
      } else {
        toast.error(data.message || 'Error creating order');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Please try again later.");
      setIsProcessing(false);
    }
  };

  const handleFreeTrial = async () => {
    if (!isLoaded) return;
    if (!user) {
      toast.info("Please login to start your free trial.");
      return;
    }
    try {
      setIsProcessing(true);
      const token = await getToken();
      const { data } = await axios.post(`${backendUrl}/api/payments/create-subscription`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key',
          subscription_id: data.subscription.id,
          name: 'InsiderJobs',
          description: '1 Month Free Trial (Auto-Pay)',
          handler: async function (response) {
            try {
              const verifyRes = await axios.post(`${backendUrl}/api/payments/verify-payment`, response, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (verifyRes.data.success) {
                setIsPremium(true);
                toast.success("Trial Started! You now have Premium Access.");
              } else {
                toast.error("Verification Failed.");
              }
            } catch (err) {
              toast.error("An error occurred during verification.");
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: { email: user.primaryEmailAddress?.emailAddress, name: user.fullName },
          theme: { color: '#2563eb' } // Blue theme
        };
        initPayment(options);
      } else {
        toast.error(data.message || 'Error creating subscription');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Please try again later.");
      setIsProcessing(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "Is the Premium Plan really a one-time payment?",
      answer: "Yes! You pay ₹10 once and get lifetime access to all premium features, including advanced resume building, mock interviews, and priority support. No hidden fees or recurring subscriptions."
    },
    {
      question: "Can I upgrade from the Free Plan later?",
      answer: "Absolutely. You can start with the Free Plan to explore the platform and upgrade to Premium whenever you're ready to unlock advanced tools and better job recommendations."
    },
    {
      question: "How does the AI-powered job match work?",
      answer: "Our intelligent matching algorithm analyzes your skills, experience, and career goals, then pairs you with job listings that perfectly align with your profile, increasing your chances of getting hired."
    },
    {
      question: "What kind of premium courses are included?",
      answer: "The Premium Plan gives you full access to our entire library of industry-relevant courses, ranging from technical skills (like coding and data analysis) to soft skills (like communication and leadership)."
    },
    {
      question: "Is there a refund policy?",
      answer: "We offer a 7-day money-back guarantee. If you're not completely satisfied with the Premium features, simply reach out to our support team within 7 days of purchase for a full refund."
    }
  ];

  const testimonials = [
    {
      name: "Priya Patel",
      role: "Software Developer",
      image: "https://i.pravatar.cc/100?img=5",
      text: "The resume builder and AI job match were game-changers for me. I landed interviews at top tech companies within weeks of upgrading!"
    },
    {
      name: "Rahul Verma",
      role: "Marketing Specialist",
      image: "https://i.pravatar.cc/100?img=8",
      text: "For just ₹10, the value is unbelievable. The mock interview questions helped me build confidence and ace my final interview rounds."
    },
    {
      name: "Sneha Reddy",
      role: "Data Analyst",
      image: "https://i.pravatar.cc/100?img=9",
      text: "I was struggling to get noticed, but the premium courses and personalized roadmaps gave my profile the edge it needed. Highly recommended!"
    }
  ];

  return (
    <div className="min-h-screen bg-[#Fdfefe] font-sans pb-16 relative overflow-x-hidden">
      
      {/* Subtle Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-yellow-50/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[150px] pointer-events-none"></div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .animate-float { animation: float-slow 4s ease-in-out infinite; }
        .animate-float-subtle { animation: float-subtle 3s ease-in-out infinite; }
        .feature-row { height: 38px; }
      `}</style>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 pt-8 lg:pt-12">
        
        {/* HEADER / HERO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10 lg:mb-12 relative z-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-bold text-[12px] mb-4">
            <Award size={14} strokeWidth={2.5} /> Invest in a Brighter You
          </div>
          <h1 className="text-[36px] md:text-[46px] font-black text-gray-900 leading-[1.1] tracking-tight mb-3">
            Choose <span className="text-blue-600">Your Plan</span>
          </h1>
          <p className="text-[16px] md:text-[18px] text-gray-500 font-medium max-w-xl leading-snug">
            Invest in your skills today. Unlock more opportunities tomorrow.
          </p>
          
          <div className="flex items-center gap-3 mt-5">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=1" alt="user" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" />
              <img src="https://i.pravatar.cc/100?img=2" alt="user" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" />
              <img src="https://i.pravatar.cc/100?img=3" alt="user" className="w-7 h-7 rounded-full border-2 border-white shadow-sm" />
            </div>
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
            </div>
            <span className="text-[12px] font-bold text-gray-500">Trusted by 50,000+ learners</span>
          </div>
        </motion.div>

        {/* MAIN PRICING LAYOUT (3-Column Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start relative z-10 mb-20">
          
          {/* LEFT: FREE PLAN CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="group/card bg-white rounded-[24px] p-6 lg:p-7 border-[2px] border-blue-500 hover:border-yellow-400 shadow-[0_12px_40px_rgba(37,99,235,0.12)] hover:shadow-[0_16px_50px_rgba(250,204,21,0.18)] transition-all duration-300 relative w-full max-w-[420px] mx-auto lg:max-w-none flex flex-col"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 group-hover/card:bg-yellow-400 text-white group-hover/card:text-yellow-950 transition-colors duration-300 font-black text-[11px] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-float-subtle">
              <Check size={12} strokeWidth={3} className="group-hover/card:hidden" />
              <Star size={12} fill="currentColor" className="hidden group-hover/card:block" />
              <span className="group-hover/card:hidden whitespace-nowrap">Selected Plan</span>
              <span className="hidden group-hover/card:block whitespace-nowrap">Premium Preview</span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 group-hover/card:bg-yellow-100 text-blue-500 group-hover/card:text-yellow-600 transition-colors duration-300 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 group-hover/card:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  <Crown size={20} fill="currentColor" className="hidden group-hover/card:block text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-gray-900 leading-tight transition-colors duration-300">Free Plan</h3>
                  <p className="text-[11px] text-gray-500 font-bold transition-colors duration-300">Get started with the basics</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <h2 className="text-[32px] font-black text-gray-900 leading-none">₹0</h2>
                <p className="text-[9px] text-gray-500 font-bold mt-1 max-w-[80px] leading-tight text-right ml-auto">After 1 month, ₹99/mo auto-pay</p>
              </div>
            </div>

            <div className="space-y-0 mb-6">
              {[
                { text: "Limited job listings", active: true },
                { text: "Basic resume tips", active: true },
                { text: "Access to free courses (limited)", active: true },
                { text: "Basic career resources", active: true },
                { text: "AI Cover Letter Generator", active: false },
                { text: "Auto Job Apply Assistant", active: false },
                { text: "Advanced Mock Interviews", active: false },
                { text: "Priority support", active: false },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 feature-row">
                  {feature.active ? (
                    <div className="w-4 h-4 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center shrink-0">
                      <Check size={10} strokeWidth={4} />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 group-hover/card:bg-yellow-50 group-hover/card:text-yellow-400 transition-colors duration-300 flex items-center justify-center shrink-0">
                      <X size={10} strokeWidth={4} />
                    </div>
                  )}
                  <span className={`text-[13px] font-bold ${feature.active ? 'text-gray-700' : 'text-gray-400 group-hover/card:text-gray-500 transition-colors duration-300'}`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={handleFreeTrial} 
              disabled={isProcessing}
              className="group mt-auto w-full py-3.5 rounded-xl font-black text-white group-hover/card:text-yellow-950 bg-blue-600 group-hover/card:bg-yellow-400 hover:bg-blue-700 group-hover/card:hover:bg-yellow-500 transition-all duration-300 hover:-translate-y-0.5 text-[14px] flex items-center justify-center shadow-sm relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed">
              <span className="flex items-center gap-2 transition-all duration-300 transform group-hover:-translate-y-12 group-hover:opacity-0">
                {isProcessing ? 'Processing...' : 'Try Free'} <ArrowRight size={16} strokeWidth={3} />
              </span>
              <span className="absolute inset-0 flex items-center justify-center gap-2 transition-all duration-300 transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                Select Plan <ArrowRight size={16} strokeWidth={3} />
              </span>
            </button>
          </motion.div>

          {/* CENTER: PREMIUM PLAN CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-[24px] p-6 lg:p-7 border-[2px] border-yellow-400 shadow-[0_12px_40px_rgba(250,204,21,0.12)] hover:shadow-[0_16px_50px_rgba(250,204,21,0.18)] transition-shadow duration-300 w-full max-w-[420px] mx-auto lg:max-w-none flex flex-col relative lg:-translate-y-4"
          >
            
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 font-black text-[11px] px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm animate-float-subtle">
              <Star size={12} fill="currentColor" /> Most Popular
            </div>

            <div className="flex items-center justify-between mb-6 mt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center shrink-0">
                  <Crown size={20} fill="currentColor" className="text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-[18px] font-black text-gray-900 leading-tight">Premium Plan</h3>
                  <p className="text-[11px] text-gray-500 font-bold">Unlock your full potential</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <h2 className="text-[38px] font-black text-gray-900 leading-none">₹10</h2>
                <p className="text-[10px] text-gray-500 font-bold mt-1">/ one-time</p>
              </div>
            </div>

            <div className="space-y-0 mb-6">
              {[
                "AI-powered job match (100% access)",
                "AI Cover Letter Generator",
                "Auto Job Apply Assistant",
                "Advanced resume builder (ATS friendly)",
                "Advanced Mock Interviews & Prep",
                "Full access to all premium courses",
                "Career guidance & personalized roadmaps",
                "Certificates & priority support"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 feature-row">
                  <div className="w-4 h-4 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center shrink-0">
                    <Check size={10} strokeWidth={4} />
                  </div>
                  <span className="text-[13px] font-bold text-gray-800 leading-tight">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <button 
                onClick={handlePremiumPayment} 
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl font-black text-yellow-950 bg-yellow-400 hover:bg-yellow-500 transition-all hover:-translate-y-0.5 text-[14px] flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                {isProcessing ? 'Processing...' : 'Upgrade to Premium'} <ArrowRight size={16} strokeWidth={3} />
              </button>
              
              <div className="mt-3.5 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  <Lock size={10} strokeWidth={3}/> Secure Payment via Razorpay
                </div>
                <div className="flex gap-2">
                   <span className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100 text-[9px] font-black italic text-gray-500">UPI</span>
                   <span className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100 text-[9px] font-black italic text-blue-800">VISA</span>
                   <span className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100 text-[9px] font-black italic text-red-600">MasterCard</span>
                   <span className="px-1.5 py-0.5 bg-gray-50 rounded border border-gray-100 text-[9px] font-black italic text-orange-600">RuPay</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: PREMIUM VISUAL / BENEFITS */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full max-w-[420px] mx-auto lg:max-w-none flex flex-col relative"
          >
            
            {/* Human Illustration (Transparent floating approach using mix-blend-darken) */}
            <div className="relative w-full h-[220px] md:h-[260px] mb-4 flex justify-center items-end">
               <img 
                 src="/assets/premium_boy_pointing.png" 
                 alt="Premium User" 
                 className="h-[120%] w-auto object-contain mix-blend-darken origin-bottom animate-float"
                 style={{ filter: 'brightness(1.1) contrast(1.1)' }}
               />

               {/* Sticky Note */}
               <div className="absolute bottom-6 left-0 bg-[#fef08a] rounded-sm p-3 shadow-md z-20 rotate-[-4deg] w-[110px] border border-[#fde047] animate-float-subtle" style={{ animationDelay: '1s' }}>
                  <p className="text-[11px] font-custom handwriting leading-tight text-yellow-900 font-bold text-center">
                    Small Investment<br/>Big Growth
                  </p>
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-blue-500/20 rounded rotate-[-2deg]"></div>
               </div>
            </div>

            {/* Compact Benefits List */}
            <div className="space-y-4 px-2 mb-6">
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center shrink-0">
                     <Star className="text-yellow-500" size={14} fill="currentColor" />
                  </div>
                  <div className="pt-0.5">
                     <h4 className="text-[13px] font-bold text-gray-900 leading-none mb-1">Better Opportunities</h4>
                     <p className="text-[11px] text-gray-500 font-semibold leading-tight">Get noticed by top companies.</p>
                  </div>
               </div>
               
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                     <Zap className="text-blue-500" size={14} fill="currentColor" strokeWidth={0}/>
                  </div>
                  <div className="pt-0.5">
                     <h4 className="text-[13px] font-bold text-gray-900 leading-none mb-1">Faster Career Growth</h4>
                     <p className="text-[11px] text-gray-500 font-semibold leading-tight">Learn in-demand skills.</p>
                  </div>
               </div>

               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                     <Target className="text-emerald-500" size={14} />
                  </div>
                  <div className="pt-0.5">
                     <h4 className="text-[13px] font-bold text-gray-900 leading-none mb-1">Expert Guidance</h4>
                     <p className="text-[11px] text-gray-500 font-semibold leading-tight">Access tools used by professionals.</p>
                  </div>
               </div>
            </div>

            {/* Compact Testimonial */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative mt-auto mx-2">
               <div className="text-[32px] text-gray-100 absolute top-1 left-2 leading-none font-serif">"</div>
               <p className="text-[11px] font-semibold text-gray-600 italic relative z-10 mb-3 leading-relaxed">
                 "Investing ₹10 in InsiderJobs Premium was the best decision. I got better job recommendations and finally cracked my first interview!"
               </p>
               <div className="flex items-center gap-2.5">
                 <img src="https://i.pravatar.cc/100?img=11" alt="Rohit" className="w-7 h-7 rounded-full" />
                 <div>
                    <h5 className="text-[11px] font-bold text-gray-900 leading-tight">Rohit Sharma</h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[9px] font-bold text-gray-400">BCA Student</p>
                      <div className="flex text-yellow-400">
                         {[...Array(5)].map((_, i) => <Star key={i} size={8} fill="currentColor" />)}
                      </div>
                    </div>
                 </div>
               </div>
            </div>

          </motion.div>
        </div>

        {/* DETAILED FEATURE COMPARISON */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-[28px] md:text-[36px] font-black text-gray-900 leading-tight mb-3">
              Compare <span className="text-blue-600">Plans</span>
            </h2>
            <p className="text-[15px] text-gray-500 font-medium">See exactly what you get when you upgrade to Premium.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="py-5 px-6 font-bold text-gray-900 text-sm w-[40%]">Features</th>
                    <th className="py-5 px-6 text-center font-bold text-gray-500 text-sm w-[30%] border-l border-gray-100">Free</th>
                    <th className="py-5 px-6 text-center font-black text-yellow-600 text-sm w-[30%] border-l border-yellow-200 bg-yellow-50/30">
                      <div className="flex items-center justify-center gap-2">
                         <Crown size={16} /> Premium
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium">
                  {[
                    { feature: "AI-Powered Job Matches", free: "Basic (3/month)", premium: "Unlimited & Advanced", highlight: true },
                    { feature: "Cover Letter Generator", free: <X size={18} className="text-gray-300 mx-auto" />, premium: "AI Personalized Letters", highlight: false },
                    { feature: "Auto Job Apply", free: <X size={18} className="text-gray-300 mx-auto" />, premium: "1-Click AI Apply", highlight: true },
                    { feature: "Resume Builder", free: "Standard Templates", premium: "ATS-Friendly + AI", highlight: false },
                    { feature: "Premium Courses", free: "First Module Only", premium: "Full Library Access", highlight: true },
                    { feature: "Advanced Mock Interviews", free: <X size={18} className="text-gray-300 mx-auto" />, premium: "Unlimited Sessions", highlight: false },
                    { feature: "Personalized Roadmap", free: <X size={18} className="text-gray-300 mx-auto" />, premium: <Check size={18} className="text-emerald-500 mx-auto" strokeWidth={3} />, highlight: false },
                    { feature: "Certificates of Completion", free: <X size={18} className="text-gray-300 mx-auto" />, premium: <Check size={18} className="text-emerald-500 mx-auto" strokeWidth={3} />, highlight: true },
                    { feature: "Priority Customer Support", free: <X size={18} className="text-gray-300 mx-auto" />, premium: "24/7 Priority", highlight: false },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-gray-700">{row.feature}</td>
                      <td className="py-4 px-6 text-center text-gray-500 border-l border-gray-100">{row.free}</td>
                      <td className={`py-4 px-6 text-center font-bold border-l ${row.highlight ? 'bg-yellow-50/10' : ''} border-yellow-200 text-gray-900`}>
                        {row.premium}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* TESTIMONIALS SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-24"
        >
          <div className="text-center mb-10">
            <h2 className="text-[28px] md:text-[36px] font-black text-gray-900 leading-tight mb-3">
              Loved by <span className="text-blue-600">Learners</span>
            </h2>
            <p className="text-[15px] text-gray-500 font-medium">Join thousands of students who accelerated their career with Premium.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative flex flex-col"
              >
                <div className="text-gray-200 mb-3"><Star size={24} fill="#fde047" strokeWidth={0} /></div>
                <p className="text-[13px] text-gray-600 font-medium leading-relaxed italic mb-6 grow">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.image} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h5 className="text-[13px] font-bold text-gray-900">{testimonial.name}</h5>
                    <p className="text-[11px] font-bold text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="mb-24 max-w-3xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="text-[28px] md:text-[36px] font-black text-gray-900 leading-tight mb-3">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </h2>
            <p className="text-[15px] text-gray-500 font-medium">Got questions? We've got answers.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div 
                key={i} 
                className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === i ? 'border-blue-200 shadow-[0_4px_20px_rgba(37,99,235,0.05)]' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white focus:outline-none"
                >
                  <span className="text-[14px] font-bold text-gray-800">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${openFaq === i ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                    {openFaq === i ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 text-[13px] text-gray-500 font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FINAL CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="bg-blue-600 rounded-[32px] p-10 md:p-14 text-center relative overflow-hidden mb-16"
        >
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-700 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-[32px] md:text-[42px] font-black text-white leading-tight mb-4">
              Ready to accelerate your career?
            </h2>
            <p className="text-[15px] md:text-[17px] text-blue-100 font-medium mb-8">
              Join thousands of learners who have upgraded to Premium and unlocked a world of opportunities. All for just ₹10.
            </p>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black px-8 py-4 rounded-xl text-[15px] transition-transform hover:-translate-y-1 shadow-lg flex items-center justify-center gap-2 mx-auto">
              Get Premium Now <ArrowRight size={18} strokeWidth={3} />
            </button>
            <p className="text-blue-200 text-[11px] font-bold mt-4 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} /> 7-day money-back guarantee
            </p>
          </div>
        </motion.div>

        {/* BOTTOM TRUST STRIP */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto"
        >
          {/* Stats Row */}
          <div className="bg-white rounded-2xl py-5 px-6 md:px-10 flex flex-wrap items-center justify-between gap-4 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative z-10">
             <div className="flex flex-col items-center text-center">
                <h4 className="text-[20px] font-black text-gray-900 leading-none mb-1">50K+</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Active Learners</p>
             </div>
             <div className="hidden sm:block w-px h-8 bg-gray-100"></div>
             <div className="flex flex-col items-center text-center">
                <h4 className="text-[20px] font-black text-gray-900 leading-none mb-1">1000+</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Hiring Partners</p>
             </div>
             <div className="hidden md:block w-px h-8 bg-gray-100"></div>
             <div className="flex flex-col items-center text-center">
                <h4 className="text-[20px] font-black text-gray-900 leading-none mb-1 flex items-center gap-1">4.8/5 <Star size={12} fill="#eab308" className="text-yellow-500"/></h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">User Rating</p>
             </div>
             <div className="hidden lg:block w-px h-8 bg-gray-100"></div>
             <div className="flex flex-col items-center text-center">
                <h4 className="text-[20px] font-black text-blue-600 leading-none mb-1">Starts Here</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Career Growth</p>
             </div>
          </div>

          {/* Tiny Trust Row */}
          <div className="mt-5 flex flex-wrap justify-center items-center gap-5 md:gap-8 relative pb-8">
              <div className="flex items-center gap-1.5 text-gray-400">
                  <ShieldCheck size={14} strokeWidth={2.5}/>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Secure Payments</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                  <Zap size={14} strokeWidth={2.5}/>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Instant Access</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                  <Clock size={14} strokeWidth={2.5}/>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-400">
                  <GraduationCap size={14} strokeWidth={2.5}/>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Trusted by Students</span>
              </div>
              
              <div className="absolute -right-4 md:-right-12 top-0 rotate-[-10deg]">
                  <p className="text-[20px] font-custom handwriting text-blue-600 font-bold opacity-80">
                    Build a Better You!
                  </p>
              </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Pricing;
