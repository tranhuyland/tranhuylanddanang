import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = "AQ.Ab8RN6JHmFJq1ulQXqyew1p6EQsg8J8Y0QZNnymfql--D1eRqw"; 

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 15).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      link: `https://tranhuyland.vn/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý AI của Trần Huy Land. 
    Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ: Trả lời thân thiện. 
    YÊU CẦU: Mỗi nhà trên 1 dòng mới với dấu (-), link dạng: [Xem chi tiết](link).`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] }] 
      })
    });

    const data = await response.json();

    // 💡 SỬA LỖI: Kiểm tra kỹ trước khi truy cập 'candidates'
    if (data.error) {
      return NextResponse.json({ reply: `🚨 LỖI GOOGLE: ${data.error.message}` });
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return NextResponse.json({ reply: "🚨 LỖI: AI không trả về phản hồi hợp lệ. Có thể tài khoản đang bị giới hạn hoặc lỗi Project." });
    }

    const reply = data.candidates[0].content.parts[0].text;
    
    // Ép kiểu xuống dòng cho đẹp
    const formattedReply = reply.replace(/-/g, '\n-');

    return NextResponse.json({ reply: formattedReply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI HỆ THỐNG: ${err.message}` });
  }
}
