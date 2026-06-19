'use client';
import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, MessageSquareText } from "lucide-react";
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
  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages(prev => [...prev, { role: "user", text }]);
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
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce hover:animate-none">
          <MessageSquareText className="w-7 h-7 text-amber-400" />
        </button>
      ) : (
        <div className="bg-white w-[90vw] sm:w-80 h-[500px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs"><Bot className="text-amber-400" /> TRỢ LÝ TRẦN HUY LAND</div>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4" /></button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-3 rounded-2xl max-w-[85%] ${m.role === "user" ? "bg-amber-500 text-black font-semibold" : "bg-slate-100 text-slate-800"}`}>
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
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); setInput(""); }} className="p-2 border-t flex gap-1.5">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 border rounded-xl px-3 text-xs" placeholder="Gõ yêu cầu..." />
            <button className="bg-slate-900 text-white p-2 rounded-xl"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      )}
    </div>
  );
}
