import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // 💡 GIẢI PHÁP MẠNH NHẤT: Dán trực tiếp Key vào đây, không phụ thuộc vào Vercel nữa!
    // Anh hãy xóa dòng chữ bên trong dấu ngoặc kép và dán mã AIzaSy... của anh vào nhé.
    const apiKey = "DÁN_API_KEY_MỚI_CỦA_ANH_VÀO_ĐÂY"; 
    
    if (!apiKey || apiKey === "AQ.Ab8RN6K8rCPotlrKXD8XAKKeSgXQyYV-NdGJ3IbRlbvfXDZYgw") {
      return NextResponse.json({ reply: "🚨 BÁO LỖI: Anh Huy quên dán mã API Key vào code rồi ạ!" });
    }

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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
