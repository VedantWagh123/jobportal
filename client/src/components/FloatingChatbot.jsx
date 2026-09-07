import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Send, Bot, User, Minimize2 } from 'lucide-react';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hi there! 👋 I am your SkillSet Career Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Dragging state
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Handle Dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const onMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Send chat history to provide context
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      
      const { data } = await axios.post('/api/users/chat', { 
        message: userMessage,
        history: history.slice(-5) // Send last 5 messages for context
      });

      if (data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't process that. Please try again." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Oops! Connection error. I am currently offline." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
        {/* Tooltip bubble */}
        <div className="bg-white px-4 py-2 rounded-2xl rounded-br-none shadow-lg mb-4 animate-bounce cursor-pointer border border-blue-100" onClick={() => setIsOpen(true)}>
          <p className="text-sm font-medium text-gray-800">
            Hi! Need help finding a job? 👋
          </p>
        </div>

        {/* Bot Icon Button */}
        <button 
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 animate-bounce" 
          style={{ animationDuration: '2s' }}
        >
          <img 
            src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillSet&backgroundColor=transparent" 
            alt="AI Assistant" 
            className="w-10 h-10 object-contain drop-shadow-md group-hover:rotate-12 transition-transform duration-300"
          />
          <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-8 right-8 z-50 flex flex-col w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.1s'
      }}
    >
      {/* Draggable Header */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between cursor-move"
        onMouseDown={onMouseDown}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
             <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillSet&backgroundColor=transparent" alt="Bot" className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Career Assistant</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-blue-100 text-xs">Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Minimize2 size={18} />
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-blue-100' : 'bg-gradient-to-tr from-purple-100 to-blue-100 border border-blue-200'}`}>
              {msg.sender === 'user' ? <User size={16} className="text-blue-600" /> : <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillSet&backgroundColor=transparent" alt="Bot" className="w-5 h-5" />}
            </div>
            <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}`}>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 max-w-[85%] self-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
               <img src="https://api.dicebear.com/7.x/bottts/svg?seed=SkillSet&backgroundColor=transparent" alt="Bot" className="w-5 h-5" />
            </div>
            <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..." 
          className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2.5 text-sm transition-all"
        />
        <button 
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Send size={18} className="ml-1" />
        </button>
      </form>
    </div>
  );
};

export default FloatingChatbot;
