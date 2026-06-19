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

    // 💡 SỬA SYSTEM PROMPT: Dùng ký tự xuống dòng rõ ràng hơn
    const systemPrompt = `Bạn là trợ lý AI của Trần Huy Land.
    Dữ liệu: ${JSON.stringify(simplifiedBds)}.
    Nhiệm vụ: Trả lời thân thiện.
    YÊU CẦU BẮT BUỘC:
    1. Mỗi bất động sản PHẢI bắt đầu bằng ký tự xuống dòng kép để tách biệt.
    2. Định dạng: "- Tên nhà | Giá: [Giá] | Bấm tại đây: [Xem chi tiết]([link])"
    3. Không được viết dính liền các căn nhà với nhau.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] }] 
      })
    });

    const data = await response.json();
    let reply = data.candidates[0].content.parts[0].text;

    // 💡 GIẢI PHÁP MẠNH: Nếu giao diện vẫn chưa xuống dòng, 
    // ta dùng lệnh thay thế thủ công dấu gạch ngang bằng ký tự xuống dòng xuống phía trước
    reply = reply.replace(/-/g, '\n\n-'); 

    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI: ${err.message}` });
  }
}
