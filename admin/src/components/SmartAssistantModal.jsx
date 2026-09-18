import { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { Bot, X, Send, User, Loader2, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const SmartAssistantModal = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am SkillSet India AI. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/intelligence/ask', { 
                chatHistory: newMessages 
            });
            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.answer || 'Sorry, I encountered an error.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: error.response?.data?.answer || 'Sorry, the server is currently unreachable.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all z-50 group"
                >
                    <Bot size={28} />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">AI</span>
                </button>
            )}

            {/* Chat Modal */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-4 flex items-center justify-between shadow-md relative overflow-hidden">
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-blue-400 opacity-20 rounded-full blur-lg"></div>
                        
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                                <Bot size={22} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-black text-white text-base tracking-tight flex items-center gap-1.5">
                                    SkillSet AI
                                    <Sparkles size={14} className="text-blue-200" />
                                </h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                                    <span className="text-blue-100 text-[11px] font-semibold tracking-wide uppercase">Online & Ready</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors relative z-10"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                    msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-gray-100 text-blue-600'
                                }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                                </div>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[13px] shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                                        : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-white border border-gray-100 text-blue-600 flex items-center justify-center shadow-sm">
                                    <Bot size={18} />
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 shadow-sm">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything about skills or jobs..."
                                className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-[13px] rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shadow-sm"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartAssistantModal;
