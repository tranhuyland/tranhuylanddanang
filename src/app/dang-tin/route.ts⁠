import { NextResponse } from 'next/server';

// 🚨 ANH HUY DÁN ĐƯỜNG LINK WEB APP GOOGLE SHEET VỪA COPY ĐƯỢC Ở BƯỚC 1 VÀO ĐÂY
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMAU3cnfP-xT1g3WZ4U8F8MlgrxOGakzCL0ylwzQDWuX0ZC-j8hW8uJkdmHFWVziI7PA/exec';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'appendRow',
        data: {
          id: Date.now().toString(), // Tự tạo ID tin bằng timestamp không trùng lặp
          title: body.title,
          price: body.price,
          area: body.area,
          location: body.location,
          direction: body.direction,
          images: body.images, 
          description: body.description,
          date: new Date().toLocaleDateString('vi-VN'),
        }
      }),
    });

    if (!response.ok) throw new Error('Không thể ghi dữ liệu vào Google Sheet');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
