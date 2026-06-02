import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const prompt = message.toLowerCase();
    let reply = "Cảm ơn anh/chị đã liên hệ Trần Huy Land. Yêu cầu tư vấn của anh/chị đã được chuyển đến anh Trần Huy (0931.555.551). Anh Huy sẽ kết nối qua Zalo hỗ trợ ngay ạ!";

    if (prompt.includes("hải châu")) {
      reply = "Dạ, khu vực Hải Châu là trung tâm cốt lõi Đà Nẵng. Anh Huy đang có giỏ hàng nhà phố kiệt ô tô và mặt tiền kinh doanh Cẩm Bá Thước sẵn sổ hồng xem ngay. Anh/chị cần phân khúc tài chính tầm mấy tỷ để em báo anh Huy gửi ạ?";
    } else if (prompt.includes("cẩm lệ")) {
      reply = "Dạ, nhà đất quận Cẩm Lệ giá đang cực tốt, tầm tài chính 3 - 5 tỷ sẵn nhiều căn kiệt rộng ô tô đỗ cửa xem sổ đỏ được ngay ạ!";
    } else if (prompt.includes("ký gửi")) {
      reply = "Dạ anh/chị muốn ký gửi nhà đất Đà Nẵng vui lòng nhấn nút 'Ký Gửi Nhanh' trên màn hình, điền thông tin để hệ thống tự động soạn sẵn tin nhắn gửi thẳng qua Zalo anh Trần Huy hỗ trợ khảo sát miễn phí ạ!";
    }
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ reply: "Dạ hệ thống tư vấn đang bận một chút, anh chị vui lòng gọi hotline 0931555551 để anh Huy hỗ trợ trực tiếp nhanh nhất." });
  }
}
