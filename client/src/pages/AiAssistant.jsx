import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Send, AlertCircle, Loader, User, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hi! I'm your Pharma Sync assistant. Ask me about symptoms, medications, or general health questions.",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text) => {
    const messageToSend = text || inputText;
    if (!messageToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: messageToSend });
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.data.reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Sorry, I encountered an issue processing your query. Please check your server logs or try again later.',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestionChips = [
    "I have a mild headache and slight fever.",
    "How should I take paracetamol safely?",
    "Tips for better sleep this week?",
    "What are early signs of dehydration?",
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 flex-grow flex flex-col h-[calc(100vh-140px)] w-full">
      {/* Header and Disclaimer */}
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-card shadow-sm animate-pulse">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-text">AI Assistant</h1>
          <p className="text-sm text-text/65">
            General guidance only — not a replacement for medical care.
          </p>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-grow bg-card border border-primary/10 rounded-2xl p-4 sm:p-6 overflow-y-auto mb-4 space-y-4 shadow-sm flex flex-col min-h-[45vh]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] flex items-start gap-3 ${
              msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            {/* Avatar */}
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                msg.sender === 'user'
                  ? 'bg-success/20 text-primary-dark font-semibold'
                  : 'bg-primary text-card'
              }`}
            >
              {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
            </span>

            {/* Message Bubble */}
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-primary text-card'
                  : msg.isError
                  ? 'bg-danger/10 border border-danger/20 text-danger'
                  : 'bg-[#FFFCF6] border border-primary/5 text-text'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="self-start flex items-center gap-2 text-sm text-text/60 italic">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            <span>Assistant is typing…</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input and suggestions */}
      <div className="border-t border-primary/10 bg-card rounded-2xl p-4 shadow-sm">
        {/* Suggestion Chips */}
        <div className="mb-3 flex flex-wrap gap-2">
          {suggestionChips.map((chip, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(chip)}
              className="rounded-full border border-primary/20 bg-[#FFFCF6] px-3 py-1 text-xs text-text/75 hover:bg-primary/10 hover:text-primary transition-all text-left max-w-full hover-scale cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            className="flex-grow px-4 py-3 bg-background border border-primary/20 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-xs text-text placeholder-text/45"
            placeholder="Ask a health question…"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="p-3 bg-primary text-card hover:bg-primary-dark rounded-xl shadow-xs transition-all hover-scale disabled:opacity-40 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Bottom disclaimer link */}
      <p className="mt-4 text-center text-xs text-text/65">
        Need to see a professional?{' '}
        <Link to="/dashboard" className="font-bold text-primary hover:underline">
          Book an appointment
        </Link>
        .
      </p>
    </div>
  );
};

export default AiAssistant;
