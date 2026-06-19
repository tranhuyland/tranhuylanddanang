'use client';
import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown"; 

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Xin chào! Em là trợ lý ảo của **Trần Huy Land**. \n\nAnh/chị đang tìm nhà khu vực nào ạ? \n- Hải Châu \n- Cẩm Lệ \n- Sơn Trà" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
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
          <Bot className="w-7 h-7" />
        </button>
      ) : (
        // Khóa cứng chiều rộng và chiều cao tại đây
        <div className="bg-white w-[320px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 p-3 text-white flex items-center justify-between shrink-0">
            <span className="font-bold text-xs uppercase text-amber-400">Trợ lý Trần Huy Land</span>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs bg-slate-50 scrollbar-hide">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-xl max-w-[90%] shadow-sm ${m.role === "user" ? "bg-amber-500 text-black font-semibold" : "bg-white text-slate-800 border border-slate-200"}`}>
                  {m.role === "ai" ? (
                    <div className="prose prose-xs max-w-none">
                       <ReactMarkdown>{m.text}</ReactMarkdown>
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Cố định */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="p-2 border-t border-slate-100 bg-white shrink-0 flex gap-2 items-center"
          >
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500" 
              placeholder="Gõ yêu cầu..." 
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
