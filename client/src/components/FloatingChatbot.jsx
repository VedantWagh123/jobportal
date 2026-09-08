import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Send, User, Minimize2, Briefcase, MapPin, IndianRupee, ChevronRight, Sparkles, RefreshCw, RotateCcw } from 'lucide-react';

// ─── Markdown Renderer ────────────────────────────────────────────────────────
const renderMarkdown = (text) => {
  if (!text) return '';
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.*?)`/g, '<code class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
  html = html.replace(/^[-•]\s+(.+)$/gm, '<li class="ml-2">$1</li>');
  html = html.replace(/(<li.*<\/li>)/gs, '<ul class="list-disc list-inside space-y-1 my-1.5 pl-1">$1</ul>');
  html = html.replace(/\n\n/g, '</p><p class="mt-2">');
  html = html.replace(/\n/g, '<br/>');
  return `<p>${html}</p>`;
};

// ─── Quick Suggestion Chips ───────────────────────────────────────────────────
const QUICK_CHIPS = [
  { label: '🔍 Python Jobs', query: 'Python jobs dikhao' },
  { label: '⚛️ React Jobs', query: 'React developer jobs hain kya' },
  { label: '📊 Data Science', query: 'Data Science jobs available hain?' },
  { label: '💡 Resume Tips', query: 'Resume improve karne ke tips do' },
  { label: '🎯 Interview Prep', query: 'Interview ki preparation kaise kare' },
];

// ─── Job Card ─────────────────────────────────────────────────────────────────
const JobCard = ({ job, onApply }) => (
  <div
    className="bg-white border border-blue-100 rounded-xl shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 overflow-hidden group cursor-pointer"
    onClick={() => onApply(job._id)}
  >
    {/* Company Header */}
    <div className="flex items-center gap-3 p-3 border-b border-gray-50 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
      <div className="w-11 h-11 rounded-xl border border-gray-100 bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
        {job.company?.image
          ? <img src={job.company.image} alt={job.company.name} className="w-full h-full object-contain p-1" />
          : <Briefcase size={20} className="text-blue-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm truncate group-hover:text-blue-700 transition-colors">{job.company?.name}</p>
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          {job.company?.industry && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">{job.company.industry}</span>
          )}
          {job.company?.companySize && (
            <span className="text-xs text-gray-500">👥 {job.company.companySize}</span>
          )}
        </div>
      </div>
    </div>

    {/* Job Details */}
    <div className="p-3">
      <h4 className="font-semibold text-gray-800 text-sm mb-2 group-hover:text-blue-700 transition-colors">{job.title}</h4>
      <div className="flex flex-wrap gap-2 mb-2.5">
        {job.location && (
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={10} /> {job.location}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
            <IndianRupee size={10} /> {(job.salary / 1000).toFixed(0)}K/yr
          </span>
        )}
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{job.jobType || 'Full Time'}</span>
        {job.level && <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">{job.level}</span>}
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {job.skills.slice(0, 4).map((skill, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{skill}</span>
          ))}
          {job.skills.length > 4 && <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>}
        </div>
      )}

      {/* Company short description */}
      {job.company?.description && (
        <p className="text-xs text-gray-400 leading-relaxed mb-2.5 line-clamp-2">{job.company.description}</p>
      )}

      {/* Apply Button */}
      <button
        className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-md hover:shadow-blue-200 active:scale-95"
        onClick={(e) => { e.stopPropagation(); onApply(job._id); }}
      >
        Apply Now <ChevronRight size={13} />
      </button>
    </div>
  </div>
);



// ─── Streaming Text Renderer ──────────────────────────────────────────────────
const StreamingText = ({ text, isStreaming }) => (
  <div className="prose prose-sm max-w-none text-gray-800">
    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
    {isStreaming && (
      <span className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse rounded-full" style={{ verticalAlign: 'text-bottom' }} />
    )}
  </div>
);

// ─── Single Message Bubble ────────────────────────────────────────────────────
const MessageBubble = ({ msg, onApply, onRegenerate, isLast, isStreaming }) => {
  const isUser = msg.sender === 'user';
  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse self-end max-w-[85%]' : 'self-start w-full max-w-[98%]'}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${isUser ? 'bg-gradient-to-tr from-blue-500 to-indigo-500' : 'bg-gradient-to-tr from-purple-100 to-blue-100 border border-blue-200'}`}>
        {isUser
          ? <User size={14} className="text-white" />
          : <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillSet&backgroundColor=transparent" alt="Bot" className="w-5 h-5" />}
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {msg.text && (
          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser
            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-sm shadow-blue-200'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}
          >
            {isUser
              ? <p className="whitespace-pre-wrap">{msg.text}</p>
              : <StreamingText text={msg.text} isStreaming={isStreaming && isLast} />}
          </div>
        )}
        {/* Job Cards */}
        {msg.type === 'job_results' && msg.jobs?.length > 0 && !isStreaming && (
          <div className="flex flex-col gap-2 mt-1">
            {msg.jobs.map((job) => <JobCard key={job._id} job={job} onApply={onApply} />)}
          </div>
        )}
        {/* Regenerate button — show on last AI message only, not while streaming */}
        {!isUser && isLast && !isStreaming && onRegenerate && (
          <button
            onClick={onRegenerate}
            className="self-start flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-100 mt-0.5"
          >
            <RotateCcw size={12} /> Regenerate
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex gap-2.5 self-start">
    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-100 to-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
      <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillSet&backgroundColor=transparent" alt="Bot" className="w-5 h-5" />
    </div>
    <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// ─── Main Floating Chatbot ────────────────────────────────────────────────────
const FloatingChatbot = () => {
  const navigate = useNavigate();
  const { backendUrl, isChatbotOpen, setIsChatbotOpen } = useContext(AppContext);
  const isOpen = isChatbotOpen;
  const setIsOpen = setIsChatbotOpen;
  const [messages, setMessages] = useState([{
    sender: 'ai', type: 'text', jobs: [],
    text: "Hi there! 👋 I'm your **SkillSet Career Assistant**.\n\nI can help you:\n- 🔍 Find jobs on this platform\n- 📝 Get resume & interview tips\n- 🎯 Plan your career path\n\nWhat would you like to do today?",
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChips, setShowChips] = useState(true);
  const [lastUserMessage, setLastUserMessage] = useState('');

  // ─── Drag state ───────────────────────────────────────────────────────────
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // ─── Resize state ─────────────────────────────────────────────────────────
  const [size, setSize] = useState({ width: 384, height: 560 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, w: 384, h: 560 });
  const [resizeEdge, setResizeEdge] = useState(null); // 'bottom-right', 'bottom-left', 'top-left', 'left', 'bottom'

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamTimerRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen, isStreaming]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Cleanup stream timer on unmount
  useEffect(() => () => clearInterval(streamTimerRef.current), []);

  // ─── Drag Logic ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging, dragStart]);

  const onMouseDownDrag = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  // ─── Resize Logic ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      const dx = e.clientX - resizeStart.x;
      const dy = e.clientY - resizeStart.y;
      setSize(prev => {
        let newW = prev.width;
        let newH = prev.height;
        if (resizeEdge === 'bottom-right') {
          newW = Math.max(280, resizeStart.w + dx);
          newH = Math.max(400, resizeStart.h + dy);
        } else if (resizeEdge === 'bottom-left') {
          newW = Math.max(280, resizeStart.w - dx);
          newH = Math.max(400, resizeStart.h + dy);
        } else if (resizeEdge === 'bottom') {
          newH = Math.max(400, resizeStart.h + dy);
        } else if (resizeEdge === 'left') {
          newW = Math.max(280, resizeStart.w - dx);
        } else if (resizeEdge === 'right') {
          newW = Math.max(280, resizeStart.w + dx);
        }
        return { width: newW, height: newH };
      });
    };
    const handleMouseUp = () => setIsResizing(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isResizing, resizeStart, resizeEdge]);

  const onResizeMouseDown = (e, edge) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeEdge(edge);
    setResizeStart({ x: e.clientX, y: e.clientY, w: size.width, h: size.height });
  };

  // ─── Streaming Simulation ─────────────────────────────────────────────────
  const streamText = (fullText, onDone) => {
    const words = fullText.split(' ');
    let i = 0;
    let accumulated = '';
    setIsStreaming(true);
    clearInterval(streamTimerRef.current);
    streamTimerRef.current = setInterval(() => {
      if (i < words.length) {
        accumulated += (i === 0 ? '' : ' ') + words[i];
        i++;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: accumulated };
          return updated;
        });
      } else {
        clearInterval(streamTimerRef.current);
        setIsStreaming(false);
        if (onDone) onDone();
      }
    }, 28); // ~28ms per word ≈ natural typing speed
  };

  // ─── Send Message ─────────────────────────────────────────────────────────
  const handleSend = useCallback(async (messageText) => {
    const userMessage = (messageText || input).trim();
    if (!userMessage || isLoading || isStreaming) return;
    clearInterval(streamTimerRef.current);

    setInput('');
    setShowChips(false);
    setLastUserMessage(userMessage);
    setMessages(prev => [...prev, { sender: 'user', type: 'text', text: userMessage, jobs: [] }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const { data } = await axios.post(`${backendUrl}/api/users/chat`, { message: userMessage, history: history.slice(-6) });

      if (data.success) {
        // Add placeholder message, then stream into it
        setMessages(prev => [...prev, { sender: 'ai', type: data.type || 'text', text: '', jobs: data.jobs || [] }]);
        setIsLoading(false);
        streamText(data.response, null);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', type: 'text', text: "Sorry, I couldn't process that. Please try again! 😊", jobs: [] }]);
        setIsLoading(false);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        sender: 'ai', type: 'error', jobs: [],
        text: "Oops! 😅 Connection error. Please check your internet and try again.",
      }]);
      setIsLoading(false);
    }
  }, [input, isLoading, isStreaming, messages]);

  // ─── Regenerate Last Response ─────────────────────────────────────────────
  const handleRegenerate = useCallback(async () => {
    if (!lastUserMessage || isLoading || isStreaming) return;
    clearInterval(streamTimerRef.current);

    // Remove last AI message and regenerate
    setMessages(prev => {
      const withoutLast = prev.filter((_, i) => i !== prev.length - 1);
      return withoutLast;
    });
    setIsLoading(true);
    setIsStreaming(false);

    try {
      const historyForRegen = messages.slice(0, -1).map(m => ({ sender: m.sender, text: m.text }));
      const { data } = await axios.post(`${backendUrl}/api/users/chat`, { message: lastUserMessage, history: historyForRegen.slice(-6) });

      if (data.success) {
        setMessages(prev => [...prev, { sender: 'ai', type: data.type || 'text', text: '', jobs: data.jobs || [] }]);
        setIsLoading(false);
        streamText(data.response, null);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', type: 'text', text: "Sorry, couldn't regenerate. Please try again!", jobs: [] }]);
        setIsLoading(false);
      }
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', type: 'error', text: "Regeneration failed. Please try again!", jobs: [] }]);
      setIsLoading(false);
    }
  }, [lastUserMessage, isLoading, isStreaming, messages]);

  const handleApply = (jobId) => { navigate(`/apply-job/${jobId}`); setIsOpen(false); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  // ─── Collapsed (Floating Button) ─────────────────────────────────────────
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <div
          className="bg-white px-4 py-2.5 rounded-2xl rounded-br-none shadow-lg cursor-pointer border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
          onClick={() => setIsOpen(true)}
        >
          <p className="text-sm font-medium text-gray-800 whitespace-nowrap">Hi! Need help finding a job? 👋</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300"
          style={{ animation: 'floatBounce 3s ease-in-out infinite' }}
        >
          <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillSet&backgroundColor=transparent" alt="AI Assistant" className="w-10 h-10 object-contain drop-shadow-md" />
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
        </button>
        <style>{`@keyframes floatBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
      </div>
    );
  }

  // ─── Open Chat Window ─────────────────────────────────────────────────────
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden select-none"
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging || isResizing ? 'none' : 'transform 0.1s',
        userSelect: isDragging || isResizing ? 'none' : 'auto',
      }}
    >
      {/* ── Resize Handles ── */}
      {/* Bottom-right corner */}
      <div className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-20 group" onMouseDown={(e) => onResizeMouseDown(e, 'bottom-right')}>
        <div className="absolute bottom-1 right-1 w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 1L1 11M11 6L6 11M11 11" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      {/* Bottom-left corner */}
      <div className="absolute bottom-0 left-0 w-5 h-5 cursor-sw-resize z-20" onMouseDown={(e) => onResizeMouseDown(e, 'bottom-left')} />
      {/* Bottom edge */}
      <div className="absolute bottom-0 left-5 right-5 h-2 cursor-s-resize z-20" onMouseDown={(e) => onResizeMouseDown(e, 'bottom')} />
      {/* Left edge */}
      <div className="absolute left-0 top-12 bottom-2 w-2 cursor-w-resize z-20" onMouseDown={(e) => onResizeMouseDown(e, 'left')} />
      {/* Right edge */}
      <div className="absolute right-0 top-12 bottom-2 w-2 cursor-e-resize z-20" onMouseDown={(e) => onResizeMouseDown(e, 'right')} />

      {/* ── Header ── */}
      <div
        className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between shrink-0 cursor-move"
        onMouseDown={onMouseDownDrag}
        style={{ userSelect: 'none' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillSet&backgroundColor=transparent" alt="Bot" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
              Career Assistant <Sparkles size={12} className="text-yellow-300" />
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-blue-100 text-xs font-medium">Online · Gemini AI</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Clear chat */}
          <button
            onClick={() => { clearInterval(streamTimerRef.current); setMessages([{ sender: 'ai', type: 'text', jobs: [], text: "Chat cleared! 🧹 How can I help you?" }]); setShowChips(true); setIsStreaming(false); }}
            className="text-white/60 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
            title="Clear chat"
          >
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer">
            <Minimize2 size={17} />
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-slate-50 to-white flex flex-col gap-4" style={{ minHeight: 0 }}>
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            msg={msg}
            onApply={handleApply}
            onRegenerate={idx === messages.length - 1 && msg.sender === 'ai' ? handleRegenerate : null}
            isLast={idx === messages.length - 1}
            isStreaming={isStreaming && idx === messages.length - 1}
          />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Chips ── */}
      {showChips && messages.length <= 1 && !isLoading && (
        <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto shrink-0">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleSend(chip.query)}
              disabled={isLoading || isStreaming}
              className="shrink-0 text-xs bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white px-3 py-1.5 rounded-full border border-blue-200 hover:border-blue-600 transition-all duration-200 font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about jobs, career tips..."
          disabled={isLoading || isStreaming}
          className="flex-1 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm transition-all outline-none disabled:opacity-60 placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading || isStreaming}
          className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0 hover:scale-105 active:scale-95 shadow-md shadow-blue-200"
        >
          <Send size={16} className="ml-0.5" />
        </button>
      </form>

      {/* ── Resize hint corner indicator ── */}
      <style>{`
        @keyframes floatBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
};

export default FloatingChatbot;
