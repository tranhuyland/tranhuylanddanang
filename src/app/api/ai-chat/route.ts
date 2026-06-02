import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const prompt = message.toLowerCase();
    let reply = "Cảm ơn anh/chị đã liên hệ Trần Huy Land. Yêu cầu tư vấn của anh/chị đã được chuyển đến anh Trần Huy (0931.555.551). Anh Huy sẽ kết nối qua Zalo hỗ trợ ngay ạ!";

    if (prompt.includes("hải châu")) {
      reply = "Dạ, khu vực Hải Châu là trung tâm cốt lõi Đà Nẵng. Anh Huy đang có giỏ hàng nhà kiệt ô tô lẫn mặt tiền kinh doanh Cẩm Bá Thước sẵn sổ hồng xem ngay. Anh/chị cần tìm phân khúc tầm tài chính mấy tỷ ạ?";
    } else if (prompt.includes("cẩm lệ")) {
      reply = "Dạ, nhà đất quận Cẩm Lệ giá đang cực tốt, tầm 3 - 5 tỷ sẵn nhiều căn kiệt ô tô rộng rãi đỗ cửa rất thích hợp định cư lâu dài. Em báo anh Huy gửi thông tin chi tiết qua cho mình nhé?";
    } else if (prompt.includes("ký gửi")) {
      reply = "Dạ, anh/chị muốn ký gửi bất động sản Đà Nẵng vui lòng bấm nút 'Ký Gửi Nhanh' trên màn hình và điền thông tin. Hệ thống sẽ soạn sẵn tin nhắn chuyển trực tiếp qua Zalo anh Trần Huy hỗ trợ quay phim khảo sát miễn phí ạ!";
    }
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ reply: "Dạ hệ thống tư vấn đang bận, anh chị vui lòng gọi hotline 0931555551 để anh Huy hỗ trợ trực tiếp nhanh nhất." });
  }
}