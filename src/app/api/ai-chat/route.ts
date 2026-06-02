import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const prompt = message.toLowerCase();
    let reply = "Cảm ơn anh/chị đã liên hệ. Yêu cầu tư vấn bất động sản tại Đà Nẵng của anh/chị đã được chuyển đến anh Trần Huy (0931.555.551). Anh Huy sẽ gọi điện hoặc kết nối Zalo hỗ trợ ngay trong 5 phút nữa ạ!";

    if (prompt.includes("hải châu")) {
      reply = "Dạ, khu vực quận Hải Châu là lõi trung tâm Đà Nẵng, mật độ dân cư cao và kinh doanh rất tốt. Anh Huy đang có giỏ hàng nhà phố kiệt ô tô lẫn mặt tiền kinh doanh Cẩm Bá Thước pháp lý sạch 100%. Anh/chị cần xem sổ đỏ phân khúc mấy tỷ để em báo anh Huy gửi ạ?";
    } else if (prompt.includes("cẩm lệ")) {
      reply = "Dạ, nhà đất quận Cẩm Lệ hiện có mức giá rất tốt, đặc biệt phân khúc nhà kiệt ô tô đỗ cửa tầm giá từ 3 - 5 tỷ được gia đình trẻ săn đón rất nhiều. Giỏ hàng chính chủ cập nhật hôm nay đang sẵn nhiều căn đẹp, pháp lý rõ ràng xem sổ đỏ ngay!";
    } else if (prompt.includes("ký gửi") || prompt.includes("bán nhà")) {
      reply = "Dạ anh/chị muốn ký gửi nhà đất Đà Nẵng, xin vui lòng bấm vào nút 'Ký Gửi Nhanh' trên màn hình, điền địa chỉ và giá mong muốn. Hệ thống sẽ soạn sẵn tin nhắn gửi thẳng qua Zalo anh Trần Huy để tiến hành khảo sát, quay phim nhà đất miễn phí cho mình ngay ạ!";
    }

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json({ reply: "Dạ, hệ thống tư vấn đang bận một chút, anh/chị vui lòng liên hệ trực tiếp hotline 0931555551 để anh Huy hỗ trợ trực tiếp ngay nhé!" }, { status: 200 });
  }
}
