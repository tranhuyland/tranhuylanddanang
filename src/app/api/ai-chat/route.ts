import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Khóa AQ của anh
    const apiKey = "AQ.Ab8RN6KMjUZOb_6cNtHTVjFnspxlBm50pibepd5Q9CRmy-RxEg"; 

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 15).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý AI của Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ: Trả lời ngắn gọn, thân thiện. Định dạng: mỗi căn nhà trên 1 dòng với dấu (-), kèm link.`;

    // 💡 BƯỚC QUYẾT ĐỊNH: Dùng Bearer Token thay vì ?key=
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // Đây là "cửa ngõ" để xác thực mã AQ
      },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] }] 
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ reply: `🚨 LỖI TỪ GOOGLE AI: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI HỆ THỐNG MẠNG: ${err.message}` });
  }
}
