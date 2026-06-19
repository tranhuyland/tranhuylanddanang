import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // 💡 Anh dán API Key của OpenAI vào đây (Mã bắt đầu bằng sk-...)
    const openAiKey = "import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // 💡 Anh dán API Key của OpenAI vào đây (Mã bắt đầu bằng sk-...)
    const openAiKey = "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; 

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 10).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      link: `https://tranhuyland.vn/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Hãy trả lời thân thiện. Mỗi nhà liệt kê trên 1 dòng mới với dấu (-). 
    Định dạng link: [Xem chi tiết](link).`;

    // 💡 GỌI API OPENAI
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}` 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Dùng model mini này rất nhanh và chuẩn
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
"; 

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 10).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      link: `https://tranhuyland.vn/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Hãy trả lời thân thiện. Mỗi nhà liệt kê trên 1 dòng mới với dấu (-). 
    Định dạng link: [Xem chi tiết](link).`;

    // 💡 GỌI API OPENAI
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}` 
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Dùng model mini này rất nhanh và chuẩn
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
