import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export async function POST(req: Request) {
  const { message } = await req.json();
  const allBds = await getBdsData();

  // Đây là phần "Huấn luyện AI": Cho nó biết nó là ai và cách đọc Sheet
  const systemPrompt = `Bạn là trợ lý ảo của Trần Huy Land. Dữ liệu nhà đất: ${JSON.stringify(allBds)}. 
  Hãy trả lời khách hàng dựa trên dữ liệu này một cách chuyên nghiệp, thân thiện. 
  Nếu khách hỏi tìm nhà, hãy lọc dữ liệu và gợi ý link: /nha-dat/[slug]`;

  try {
    // Gọi API của Google Gemini (Anh sẽ cần 1 API KEY miễn phí từ aistudio.google.com)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\nKhách hỏi: ${message}` }] }] })
    });

    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ reply: "Xin lỗi, hệ thống đang bận. Anh Huy liên hệ 0905 77 88 52 nhé!" });
  }
}
