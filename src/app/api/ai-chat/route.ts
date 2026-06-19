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
      link: `/nha-dat/${item.slug}`
    }));

    // Cập nhật systemPrompt đã tối ưu để hiển thị Link bấm được
    const systemPrompt = `Bạn là trợ lý AI chuyên nghiệp của Trần Huy Land. 
    Dữ liệu sản phẩm: ${JSON.stringify(simplifiedBds)}. 
    
    YÊU CẦU ĐỊNH DẠNG:
    - Trả lời thân thiện.
    - Mỗi bất động sản trình bày trên 1 dòng mới với dấu (-).
    - Cấu trúc mỗi dòng: "- [Tên nhà] - Giá: [Giá]. Link: [Xem chi tiết](https://tranhuyland.vn[link])"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey 
      },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] }] 
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ reply: `🚨 LỖI: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI HỆ THỐNG: ${err.message}` });
  }
}
