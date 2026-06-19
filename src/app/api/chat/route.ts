import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const allBds = await getBdsData();

    // 💡 BƯỚC TỐI ƯU CỨU MẠNG: Tinh gọn dữ liệu trước khi nạp cho AI
    // Chỉ lấy các trường thật sự cần thiết, loại bỏ link ảnh và mô tả dài để không bị quá tải API
    const simplifiedBds = allBds.map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      dienTich: item.dienTich || "",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    // Huấn luyện AI với dữ liệu đã được làm nhẹ
    const systemPrompt = `Bạn là trợ lý ảo của sàn bất động sản Trần Huy Land tại Đà Nẵng. 
    Dữ liệu giỏ hàng hiện tại: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ của bạn:
    1. Trả lời khách hàng thật thân thiện, chuyên nghiệp và ngắn gọn.
    2. Nếu khách hỏi tìm nhà, hãy đối chiếu với "Dữ liệu giỏ hàng", gợi ý tối đa 3 căn phù hợp nhất.
    3. BẮT BUỘC cung cấp kèm đường dẫn (link) của căn nhà đó để khách bấm vào xem chi tiết.`;

    // Gọi API của Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] 
        }] 
      })
    });

    const data = await response.json();

    // Bắt lỗi rõ ràng nếu Google API hết hạn mức hoặc lỗi Key
    if (data.error) {
      console.error("Lỗi từ Google Gemini:", data.error.message);
      return NextResponse.json({ reply: "Dạ xin lỗi, hệ thống AI đang quá tải. Anh/chị liên hệ Zalo số 0905 77 88 52 để em hỗ trợ trực tiếp nhé!" });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err) {
    console.error("Lỗi server Chatbot:", err);
    return NextResponse.json({ reply: "Dạ xin lỗi, đường truyền đang bị gián đoạn. Anh/chị liên hệ Zalo 0905 77 88 52 giúp em nhé!" });
  }
}
