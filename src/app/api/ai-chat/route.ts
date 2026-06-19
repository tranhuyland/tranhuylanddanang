import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Sử dụng mã AQ của anh
    const apiKey = "AQ.Ab8RN6JHmFJq1ulQXqyew1p6EQsg8J8Y0QZNnymfql--D1eRqw"; // Dán đủ mã AQ... của anh vào đây

    const allBds = await getBdsData();
    const simplifiedBds = allBds.slice(0, 15).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    const systemPrompt = `Bạn là trợ lý AI của Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ: Trả lời ngắn gọn, thân thiện. Định dạng: mỗi căn nhà trên 1 dòng với dấu (-), kèm link.`;

    // 💡 GIẢI PHÁP: Gọi qua API version v1 thay vì v1beta
    // Một số project Google Cloud yêu cầu v1 để nhận diện mã AQ
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey // Truyền qua header đặc biệt của Google Cloud
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
