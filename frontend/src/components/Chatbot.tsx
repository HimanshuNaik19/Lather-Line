import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { chatApi } from '@/api/chatApi';
import type { ChatMessage } from '@/types';
import { clsx } from 'clsx';

const WELCOME_MESSAGE: ChatMessage = {
  sender: 'bot',
  text: "👋 Hi! I'm Lather & Line's assistant. Ask me about scheduling, pricing, order tracking, or anything else!",
  timestamp: new Date(),
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage(text);
      const botMsg: ChatMessage = {
        sender: 'bot',
        text: res.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "Sorry, I'm having trouble connecting. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    'How do I schedule a pickup?',
    'What are your prices?',
    'How long does delivery take?',
  ];

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen((o) => !o)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300',
          'bg-brand-gradient text-white hover:scale-110 active:scale-95',
          isOpen ? 'rotate-90' : 'animate-pulse-glow',
        )}
        aria-label="Toggle chat assistant"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          id="chatbot-panel"
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl overflow-hidden shadow-card border border-surface-border animate-slide-up"
          style={{ background: 'linear-gradient(145deg, #1a2535, #1e2d42)' }}
        >
          {/* Header */}
          <div className="bg-brand-gradient px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm font-display">Lather Assistant</p>
              <p className="text-teal-100 text-xs">Online · Typically replies instantly</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="h-72 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  'flex gap-2 animate-slide-up',
                  msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                {/* Avatar */}
                <div
                  className={clsx(
                    'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs',
                    msg.sender === 'bot'
                      ? 'bg-brand-500/30 text-brand-300'
                      : 'bg-surface-input text-gray-300',
                  )}
                >
                  {msg.sender === 'bot' ? <Bot size={14} /> : <User size={14} />}
                </div>

                {/* Bubble */}
                <div
                  className={clsx(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    msg.sender === 'bot'
                      ? 'bg-surface-input text-gray-200 rounded-tl-sm'
                      : 'bg-brand-gradient text-white rounded-tr-sm',
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2 animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-brand-500/30 flex items-center justify-center">
                  <Bot size={14} className="text-brand-300" />
                </div>
                <div className="bg-surface-input rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-typing-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-typing-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-typing-3" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions — only show at start */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(sendMessage, 0);
                  }}
                  className="text-xs bg-surface-input border border-surface-border text-brand-300 rounded-full px-3 py-1 hover:bg-brand-500/20 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-1">
            <div className="flex gap-2 items-center bg-surface-input rounded-xl border border-surface-border focus-within:border-brand-500 transition-colors px-3 py-2">
              <input
                ref={inputRef}
                id="chatbot-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-500 outline-none"
                aria-label="Chat message input"
              />
              <button
                id="chatbot-send"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition-transform"
                aria-label="Send message"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
