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

  // Tự động cuộn xuống dưới cùng
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, isOpen, loading]);

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
        <div className="bg-white w-[320px] sm:w-[350px] h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 p-3 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-amber-400 uppercase tracking-wider">Trợ lý Trần Huy Land</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1.5 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm bg-slate-50 scrollbar-hide">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 max-w-[85%] shadow-sm ${m.role === "user" ? "bg-amber-500 text-black font-semibold rounded-2xl rounded-tr-sm" : "bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm"}`}>
                  {m.role === "ai" ? (
                    <div className="prose prose-sm max-w-none">
                       <ReactMarkdown
                         components={{
                           // Cấu hình để thẻ link mở ra tab Zalo mới mượt mà
                           a: ({ node, ...props }) => (
                             <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold underline" />
                           ),
                           p: ({ node, ...props }) => <p {...props} className="mb-1 last:mb-0" />,
                           ul: ({ node, ...props }) => <ul {...props} className="pl-4 mb-1 list-disc" />,
                           strong: ({ node, ...props }) => <strong {...props} className="font-bold text-black" />
                         }}
                       >
                         {m.text}
                       </ReactMarkdown>
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}
            
            {/* Hiệu ứng loading thân thiện */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200 flex items-center gap-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span className="text-xs text-slate-500 font-medium tracking-wide">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="p-3 border-t border-slate-100 bg-white shrink-0 flex gap-2 items-center"
          >
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
              placeholder="Nhập câu hỏi của anh/chị..." 
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="bg-slate-900 text-amber-400 p-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
