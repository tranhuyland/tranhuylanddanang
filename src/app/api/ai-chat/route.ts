import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const groqKey = "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"; 

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 10).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      link: `https://tranhuyland.vn/nha-dat/${item.slug}`
    }));

    // 💡 ÉP AI TRẢ VỀ HTML ĐỂ CÓ THỂ BẤM ĐƯỢC LINK
    const systemPrompt = `Bạn là trợ lý Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}.
    YÊU CẦU:
    1. Trả lời thân thiện.
    2. Mỗi căn nhà trình bày trên 1 dòng.
    3. Định dạng bắt buộc: "Tên nhà - Giá: [Giá]. <a href='[link]' target='_blank'>Xem chi tiết</a>"
    4. Không dùng Markdown, chỉ dùng HTML cơ bản.`;

    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    let reply = data.choices[0].message.content;

    // Thay thế các dòng thành thẻ <br/> để xuống dòng thật
    reply = reply.replace(/\n/g, '<br/>');

    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI: ${err.message}` });
  }
}
