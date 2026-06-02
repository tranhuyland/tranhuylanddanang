'use client';
import React, { useState } from "react";
import { X, Send, Bot } from "lucide-react";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Xin chào! Em là trợ lý ảo AI của anh Trần Huy Land. Anh/chị cần tìm hiểu phân khúc nhà đất nào tại Hải Châu, Cẩm Lệ Đà Nẵng ạ?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "ai", text: "Dạ, hệ thống đang bận một chút, anh/chị liên hệ trực tiếp qua Zalo anh Huy (0931555551) để được tư vấn trực tiếp ngay ạ!" }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 hidden md:block">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-slate-800 transition-all transform hover:scale-105"><Bot className="w-6 h-6 text-amber-400" /></button>
      ) : (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
          <div className="bg-slate-900 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-amber-400" /><span className="font-bold text-xs">AI TƯ VẤN NHÀ ĐẤT</span></div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs no-scrollbar">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-2.5 rounded-xl leading-relaxed ${m.role === "user" ? "bg-amber-500 text-slate-900 font-medium" : "bg-slate-100 text-slate-800"}`}>{m.text}</div>
              </div>
            ))}
            {loading && <div className="text-slate-400 text-[11px] animate-pulse">AI đang phân tích giỏ hàng...</div>}
          </div>
          <form onSubmit={handleSend} className="p-2 border-t flex gap-1.5 bg-slate-50">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tìm mua nhà Hải Châu, Cẩm Lệ..." className="flex-1 bg-white border rounded-xl px-3 text-xs focus:outline-none focus:border-amber-500" />
            <button type="submit" className="w-8 h-8 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800"><Send className="w-3.5 h-3.5" /></button>
          </form>
        </div>
      )}
    </div>
  );
}
