import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // API Key của anh
    const groqKey = "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"; 

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 10).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      link: `https://tranhuyland.vn/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Hãy trả lời thân thiện. Mỗi nhà liệt kê trên 1 dòng mới với dấu (-). 
    Định dạng link: [Xem chi tiết](link).`;

    // Gọi API với model mới nhất
    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}` 
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Model mới nhất và ổn định
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ reply: `🚨 LỖI GROQ: ${data.error.message}` });
    }

    // Lấy nội dung phản hồi
    let reply = data.choices[0].message.content;
    
    // Ép kiểu xuống dòng cho các dấu gạch đầu dòng để hiển thị rõ ràng hơn
    reply = reply.replace(/-/g, '\n-');

    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI KẾT NỐI: ${err.message}` });
  }
}
