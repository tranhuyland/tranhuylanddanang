import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Khóa chuẩn của anh
    const apiKey = "AQ.Ab8RN6K_lw86orz9bSapagozzM2gxSEcbJPA-YU-8cxzAM0HjQ"; 

    const allBds = await getBdsData();

    const simplifiedBds = allBds.slice(0, 10).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý ảo của sàn bất động sản Trần Huy Land tại Đà Nẵng. 
    Dữ liệu 10 căn mới nhất: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ của bạn:
    1. Trả lời khách hàng thật thân thiện, chuyên nghiệp và ngắn gọn.
    2. Nếu khách hỏi tìm nhà, hãy đối chiếu với dữ liệu, gợi ý tối đa 3 căn phù hợp nhất.
    3. BẮT BUỘC cung cấp kèm đường dẫn (link) của căn nhà đó để khách bấm vào xem chi tiết.`;

    // 💡 ĐIỂM QUYẾT ĐỊNH: Đổi tên model thành gemini-2.5-flash chuẩn với tài khoản của anh
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey 
      },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] 
        }] 
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Lỗi từ Google Gemini:", data.error);
      return NextResponse.json({ reply: `🚨 LỖI TỪ GOOGLE AI: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("Lỗi server Chatbot:", err);
    return NextResponse.json({ reply: `🚨 LỖI HỆ THỐNG MẠNG: ${err.message}` });
  }
}
