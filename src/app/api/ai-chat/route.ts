import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

// Ép Vercel cho phép chạy tối đa thời gian (tránh bị cắt cầu dao giữa chừng)
export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Khai báo Key AI
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      return NextResponse.json({ reply: "🚨 BÁO LỖI: Hệ thống Vercel chưa nhận được biến môi trường GEMINI_API_KEY. Anh Huy vui lòng kiểm tra lại tab Settings > Environment Variables và bấm Redeploy nhé!" });
    }

    const allBds = await getBdsData();

    // CHỈ LẤY 15 CĂN ĐẦU TIÊN để AI đọc siêu nhanh, chống lỗi Timeout 10s của Vercel
    const simplifiedBds = allBds.slice(0, 15).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý AI của Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. Hãy trả lời ngắn gọn, thân thiện và luôn kèm link sản phẩm.`;

    // 💡 ĐÃ SỬA: Cập nhật thành model gemini-2.5-flash siêu thông minh của Google
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] }] 
      })
    });

    const data = await response.json();

    // Nếu Google Gemini từ chối, in thẳng lỗi ra màn hình
    if (data.error) {
      return NextResponse.json({ reply: `🚨 LỖI TỪ GOOGLE AI: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err: any) {
    // Nếu sập mạng hoặc lỗi Server, in thẳng lỗi ra màn hình
    return NextResponse.json({ reply: `🚨 LỖI HỆ THỐNG MẠNG: ${err.message}` });
  }
}
