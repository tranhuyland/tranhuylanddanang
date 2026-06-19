'use client';
import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown"; 

// 🛠️ BỘ LỌC THÔNG MINH: Chuyển đổi HTML của AI thành Markdown chuẩn
const formatAIResponse = (text: string) => {
  if (!text) return "";
  let formatted = text.replace(/<br\s*\/?>/gi, '\n\n'); // Biến thẻ <br/> thành 2 lần Enter (xuống dòng)
  formatted = formatted.replace(/<a\s+href=['"]([^'"]+)['"][^>]*>(.*?)<\/a>/gi, '[$2]($1)'); // Biến thẻ <a> thành link Markdown
  return formatted;
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Xin chào! Em là trợ lý ảo của **Trần Huy Land**. \n\nAnh/chị đang tìm nhà khu vực nào ạ? \n- Hải Châu \n- Cẩm Lệ \n- Sơn Trà" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        <div className="bg-white w-[340px] sm:w-[380px] h-[520px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-slate-900 p-3.5 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-amber-400 text-slate-900 rounded-full flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-sm text-amber-400 uppercase tracking-wider">Trợ lý Trần Huy Land</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 p-1.5 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-5 bg-slate-50 scrollbar-hide">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3.5 max-w-[88%] shadow-sm text-[15px] leading-relaxed ${m.role === "user" ? "bg-amber-500 text-slate-950 font-medium rounded-2xl rounded-tr-sm" : "bg-white text-slate-900 border border-slate-200 rounded-2xl rounded-tl-sm"}`}>
                  {m.role === "ai" ? (
                    <div className="prose prose-sm max-w-none">
                       <ReactMarkdown
                         components={{
                           a: ({ node, ...props }) => (
                             <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold underline" />
                           ),
                           p: ({ node, ...props }) => <p {...props} className="mb-3 last:mb-0" />,
                           ul: ({ node, ...props }) => <ul {...props} className="pl-5 mb-3 list-disc space-y-1.5" />,
                           li: ({ node, ...props }) => <li {...props} className="pl-1" />,
                           strong: ({ node, ...props }) => <strong {...props} className="font-bold text-black" />
                         }}
                       >
                         {/* Gọi hàm bùa chú ở đây để lọc nội dung trước khi render */}
                         {formatAIResponse(m.text)}
                       </ReactMarkdown>
                    </div>
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm border border-slate-200 flex items-center gap-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  <span className="text-[14px] text-slate-600 font-medium tracking-wide">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
            className="p-3.5 border-t border-slate-100 bg-white shrink-0 flex gap-2.5 items-center"
          >
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="flex-1 border border-slate-200 bg-slate-50 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" 
              placeholder="Nhập câu hỏi..." 
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="bg-slate-900 text-amber-400 p-3 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
