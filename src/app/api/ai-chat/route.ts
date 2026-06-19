import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // API Key chuẩn từ image_5.png
    const apiKey = "AQ.Ab8RN6KMjUZOb_6cNtHTVjFnspxlBm50pibepd5Q9CRmy-RxEg"; 

    const allBds = await getBdsData();

    const simplifiedBds = allBds.slice(0, 15).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý AI của Trần Huy Land. 
    Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ: Trả lời ngắn gọn, thân thiện. 
    ĐỊNH DẠNG: Mỗi căn nhà hiển thị trên 1 dòng riêng bằng dấu gạch đầu dòng (-). 
    Luôn kèm link sản phẩm cuối mỗi dòng.`;

    // 💡 ĐÚNG CHUẨN: Truyền key qua URL, không dùng Authorization Header
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] }] 
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Lỗi Google:", data.error);
      return NextResponse.json({ reply: `🚨 LỖI TỪ GOOGLE AI: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI HỆ THỐNG MẠNG: ${err.message}` });
  }
}
