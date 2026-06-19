import { NextResponse } from 'next/server';
import { getBdsData } from '@/lib/googleSheets';

export const maxDuration = 30; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // API Key của anh đã được dán vào đây
    const apiKey = "AQ.Ab8RN6K_lw86orz9bSapagozzM2gxSEcbJPA-YU-8cxzAM0HjQ"; 

    if (!apiKey) {
      return NextResponse.json({ reply: "🚨 BÁO LỖI: Anh Huy chưa dán mã API Key vào code!" });
    }

    const allBds = await getBdsData();

    const simplifiedBds = allBds.slice(0, 15).map((item: any) => ({
      tieuDe: item.tieude || item.title || "",
      gia: item.gia || item.soGia || "Liên hệ",
      khuVuc: item.khuVucFull || item.diaChi || "",
      link: `/nha-dat/${item.slug}`
    }));

    // 💡 ĐÃ SỬA: Thêm yêu cầu định dạng xuống dòng để AI trả kết quả dễ đọc
    const systemPrompt = `Bạn là trợ lý AI của Trần Huy Land. Dữ liệu: ${JSON.stringify(simplifiedBds)}. 
    Nhiệm vụ của bạn:
    1. Trả lời ngắn gọn, thân thiện.
    2. Nếu khách tìm nhà, hãy gợi ý tối đa 3 căn phù hợp nhất.
    3. ĐỊNH DẠNG: Mỗi căn nhà trình bày trên 1 dòng riêng biệt bằng dấu gạch đầu dòng (-). 
    4. Luôn cung cấp link sản phẩm ở cuối mỗi dòng.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: `${systemPrompt}\n\nKhách hỏi: ${message}` }] }] 
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ reply: `🚨 LỖI TỪ GOOGLE AI: ${data.error.message}` });
    }

    const reply = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ reply });

  } catch (err: any) {
    return NextResponse.json({ reply: `🚨 LỖI HỆ THỐNG MẠNG: ${err.message}` });
  }
}
