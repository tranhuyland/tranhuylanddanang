import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = "AQ.Ab8RN6JHmFJq1ulQXqyew1p6EQsg8J8Y0QZNnymfql--D1eRqw"; 

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 10).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      link: `https://tranhuyland.vn/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. Hãy liệt kê từng căn, định dạng: - [Tên nhà] | Giá: [Giá] | [Xem chi tiết]([link])`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] }] 
      })
    });

    const data = await response.json();

    // KIỂM TRA LỖI QUOTA HOẶC XÁC THỰC
    if (data.error) {
      console.error("Lỗi Google:", data.error);
      return NextResponse.json({ reply: `🚨 Hệ thống AI đang tạm dừng (Lỗi: ${data.error.message}). Anh Huy kiểm tra lại hạn mức API trong Google Cloud nhé!` });
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return NextResponse.json({ reply: "🚨 AI không phản hồi dữ liệu. Có thể anh đã dùng hết hạn mức miễn phí hôm nay." });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI KẾT NỐI: ${err.message}` });
  }
}
