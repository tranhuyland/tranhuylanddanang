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
      // Đảm bảo link là đường dẫn đầy đủ
      link: `https://tranhuyland.vn/nha-dat/${item.slug}`
    }));

    // 💡 SỬA SYSTEM PROMPT ĐỂ ÉP AI DÙNG MARKDOWN CHUẨN
    const systemPrompt = `Bạn là trợ lý Trần Huy Land. 
    Dữ liệu sản phẩm: ${JSON.stringify(simplifiedBds)}. 
    
    YÊU CẦU ĐỊNH DẠNG (Bắt buộc):
    - Trả lời thân thiện.
    - Mỗi căn nhà phải nằm trên một dòng riêng biệt, bắt đầu bằng dấu gạch đầu dòng (-).
    - Cấu trúc: "- [Tên nhà] - Giá: [Giá]. Link: [Xem chi tiết]([link])"
    - Tuyệt đối không để link dính liền vào văn bản, phải có khoảng cách và xuống dòng rõ ràng giữa các căn nhà.`;

    const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}` 
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ reply: `🚨 LỖI: ${data.error.message}` });
    }

    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI HỆ THỐNG: ${err.message}` });
  }
}
