'use client';
import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, MessageSquareText, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Xin chào! Em là trợ lý ảo của **Trần Huy Land**. Anh/chị đang tìm nhà khu vực nào ạ? \n\n*Ví dụ: Nhà Hải Châu, Đất nền Cẩm Lệ, Cho thuê nhà phố...*" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    
    // Thêm tin nhắn user
    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Anh Huy đang bận, anh/chị nhắn Zalo [0905778852](https://zalo.me/84905778852) giúp em nhé!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[9999]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-14 h-14 bg-slate-900 text-amber-400 rounded-full flex items-center justify-center shadow-2xl animate-bounce hover:animate-none transition-transform hover:scale-105"
        >
          <MessageSquareText className="w-7 h-7" />
        </button>
      ) : (
        <div className="bg-white w-[90vw] sm:w-80 h-[500px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Bot className="text-amber-400 w-5 h-5" /> TRỢ LÝ TRẦN HUY
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-slate-50 no-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${m.role === "user" ? "bg-amber-500 text-black font-medium" : "bg-white text-slate-800 border"}`}>
                  {m.role === "ai" ? (
                    <ReactMarkdown className="prose prose-sm max-w-none prose-p:my-1 prose-a:text-blue-600 prose-strong:text-amber-700">
                      {m.text}
                    </ReactMarkdown>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span className="text-xs text-slate-400">Đang tìm nhà...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="p-3 border-t bg-white flex gap-2 items-center"
          >
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
              placeholder="Gõ yêu cầu tìm nhà..." 
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 text-white p-2.5 rounded-full hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div> 
  );
}
