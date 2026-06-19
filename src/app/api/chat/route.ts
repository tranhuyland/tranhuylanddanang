import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const allBds = await getBdsData();

    // 💡 GIẢI PHÁP CHỐNG QUÁ TẢI TỐI ĐA: 
    // 1. Chỉ lấy 50 căn mới nhất (dùng .slice(0, 50)) để API Google không bị ngộp
    // 2. Tinh gọn dữ liệu truyền vào
    const simplifiedBds = allBds.slice(0, 50).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      dienTich: item.dienTich || "",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    // Huấn luyện AI với dữ liệu siêu nhẹ
    const systemPrompt = `Bạn là trợ lý ảo của sàn bất động sản Trần Huy Land tại Đà Nẵng. 
    Dữ liệu 50 căn mới nhất: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ của bạn:
    1. Trả lời khách hàng thật thân thiện, chuyên nghiệp và ngắn gọn.
    2. Nếu khách hỏi tìm nhà, hãy đối chiếu với dữ liệu, gợi ý tối đa 3 căn phù hợp nhất.
    3. BẮT BUỘC cung cấp kèm đường dẫn (link) của căn nhà đó để khách bấm vào xem chi tiết.`;

    // Khai báo Key trực tiếp để test (Nếu anh quên chưa cài trên Vercel, anh có thể dán API Key trực tiếp vào chữ process.env.GEMINI_API_KEY tạm thời để test)
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
      console.error("LỖI: Chưa có GEMINI_API_KEY");
      return NextResponse.json({ reply: "Dạ xin lỗi, hệ thống AI đang bảo trì do thiếu mã khóa. Anh/chị liên hệ Zalo số 0905 77 88 52 để em hỗ trợ trực tiếp nhé!" });
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
      return NextResponse.json({ reply: "Dạ xin lỗi, hệ thống AI đang quá tải lượt hỏi. Anh/chị liên hệ Zalo số 0905 77 88 52 nhé!" });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err) {
    console.error("Lỗi server Chatbot:", err);
    return NextResponse.json({ reply: "Dạ xin lỗi, đường truyền mạng đang bị gián đoạn. Anh/chị liên hệ Zalo 0905 77 88 52 giúp em nhé!" });
  }
}
