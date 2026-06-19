import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // CHỈ DÁN MÃ SK-... VÀO TRONG DẤU NGOẶC KÉP NÀY THÔI NHÉ
    const openAiKey = "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"; 

    if (!openAiKey || openAiKey.includes("xxxxx")) {
        return NextResponse.json({ reply: "🚨 Anh Huy chưa dán đúng mã API Key OpenAI vào code ạ!" });
    }

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 10).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      link: `https://tranhuyland.vn/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Hãy trả lời thân thiện. Mỗi nhà liệt kê trên 1 dòng mới với dấu (-). 
    Định dạng link: [Xem chi tiết](link).`;

    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}` 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ reply: `🚨 LỖI OPENAI: ${data.error.message}` });
    }

    const reply = data.choices[0].message.content;
    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI KẾT NỐI: ${err.message}` });
  }
}
