'use client';
import React, { useState, useEffect, useRef } from "react";
import { X, Send, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown"; 

// 🛠️ DANH SÁCH THẺ BẤM NHANH
const QUICK_REPLIES = [
  "🏠 Nhà Hải Châu", 
  "💰 Dưới 3 Tỷ", 
  "🏢 Mặt tiền kinh doanh", 
  "🔑 Nhà cho thuê"
];

// 🛠️ BỘ LỌC THÔNG MINH
const formatAIResponse = (text: string) => {
  if (!text) return "";
  let formatted = text.replace(/<br\s*\/?>/gi, '\n\n'); 
  formatted = formatted.replace(/<a\s+href=['"]([^'"]+)['"][^>]*>(.*?)<\/a>/gi, '[$2]($1)'); 
  
  // 1. Tự động đánh số thứ tự và BÔI ĐEN chữ "Bán nhà", "Bán đất" ở đầu dòng
  let counter = 1;
  formatted = formatted.replace(/^[ \t]*(?:[-*]\s*|\d+\.\s*)?(bán nhà|bán đất)/gim, (match, p1) => {
    // Viết hoa chữ cái đầu cho chuẩn form: Bán nhà / Bán đất
    const capitalized = p1.charAt(0).toUpperCase() + p1.slice(1).toLowerCase();
    // Đổi thành danh sách có số 1. 2. 3.
    return `${counter++}. **${capitalized}**`;
  });

  // 2. Dùng thẻ in nghiêng (_) của Markdown để làm "bùa chú" tô đỏ giá tiền
  formatted = formatted.replace(/(\d+(?:[.,]\d+)?\s*(?:tỷ|ty|triệu|trieu|tr\/tháng))/gi, '_$1_');
  formatted = formatted.replace(/\*\*\*\*/g, '**'); 
  
  return formatted;
};

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Xin chào! Em là trợ lý ảo của **Trần Huy Land**. \n\nAnh/chị đang tìm nhà khu vực nào ạ? Hoặc bấm chọn các gợi ý bên dưới nhé!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.
