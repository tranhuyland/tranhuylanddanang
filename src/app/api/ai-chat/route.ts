import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

// 💡 Ép Vercel cho phép chạy tối đa thời gian 30s (tránh bị cắt cầu dao 10s mặc định)
export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const allBds = await getBdsData();

    // 💡 GIẢI PHÁP CHỐNG QUÁ TẢI TỐI ĐA: 
    // 1. Chỉ lấy 10 căn mới nhất (dùng .slice(0, 10)) để API Google không bị ngộp
    // 2. Tinh gọn dữ liệu truyền vào
    const simplifiedBds = allBds.slice(0, 10).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      dienTich: item.dienTich || "",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    // Huấn luyện AI với dữ liệu siêu nhẹ
    const systemPrompt = `Bạn là trợ lý ảo của sàn bất động sản Trần Huy Land tại Đà Nẵng. 
    Dữ liệu 10 căn mới nhất: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ của bạn:
    1. Trả lời khách hàng thật thân thiện, chuyên nghiệp và ngắn gọn.
    2. Nếu khách hỏi tìm nhà, hãy đối chiếu với dữ liệu, gợi ý tối đa 3 căn phù hợp nhất.
    3. BẮT BUỘC cung cấp kèm đường dẫn (link) của căn nhà đó để khách bấm vào xem chi tiết.`;

    // Khai báo Key trực tiếp để test (Nếu anh quên chưa cài trên Vercel, anh có thể dán API Key trực tiếp vào chữ process.env.GEMINI_API_KEY tạm thời để test)
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      console.error("LỖI: Chưa có GEMINI_API_KEY");
      return NextResponse.json({ reply: "🚨 BÁO LỖI: Hệ thống Vercel chưa nhận được biến môi trường GEMINI_API_KEY. Anh Huy vui lòng kiểm tra lại tab Settings > Environment Variables và bấm Redeploy nhé!" });
    }

    // Gọi API của Google Gemini
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
