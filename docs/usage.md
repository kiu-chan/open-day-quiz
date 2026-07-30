# Hướng dẫn sử dụng

## Ba màn hình, ba đường vào

| Màn hình | Đường vào | Chạy trên |
| --- | --- | --- |
| Danh sách bộ quiz | `#/admin` | máy của người điều khiển |
| Soạn quiz | `#/admin/quiz/<id>` | máy của người điều khiển |
| Bàn điều khiển | `#/admin/live` | máy của người điều khiển |
| Người chơi | `#/play` | điện thoại khách (vào bằng QR) |
| Màn hình lớn | `#/display` | máy nối máy chiếu |

Trang admin có sẵn hai link mở nhanh `#/display` và `#/play` ở góc phải để thử.

> **Chưa có mật khẩu.** Ai biết `#/admin/live` là điều khiển được trận đấu. Đừng
> chiếu đường dẫn admin lên máy chiếu.

## Chuẩn bị trước sự kiện

1. `npm run dev:lan`, ghi lại địa chỉ `Network` (ví dụ `http://192.168.1.20:5173`).
2. Mở `#/admin` bằng địa chỉ đó, soạn bộ câu hỏi. Mọi thay đổi tự lưu, không có
   nút Lưu.
3. Mỗi câu đặt thời lượng riêng (5–120 giây). Câu dài, nhiều chữ thì cho nhiều
   thời gian hơn.
4. Bộ quiz phải "chơi được" mới mở phiên được: có tên, có ít nhất một câu, và mọi
   câu đều đủ nội dung + đáp án. Trang admin liệt kê thẳng chỗ còn thiếu.
5. Mở `#/display` trên máy chiếu, để nguyên đó.

## Chạy một trận

| Bước | Làm gì | Người chơi thấy | Máy chiếu thấy |
| --- | --- | --- | --- |
| 1 | Ở `#/admin`, bấm **Mở phiên** trên bộ quiz | — | QR to + số người vào |
| 2 | Khách quét QR, nhập tên | "Đã vào, chờ bắt đầu" | số người tăng dần |
| 3 | Bấm **Bắt đầu** | 4 ô đáp án + đồng hồ | câu hỏi chữ lớn + đồng hồ |
| 4 | Chờ hết giờ (tự chốt) hoặc bấm **Hiện đáp án** | đúng/sai + điểm vừa nhận | đáp án đúng + số người chọn từng ô |
| 5 | Bấm **Câu tiếp** | câu mới | câu mới |
| 6 | Sau câu cuối, bấm **Xem kết quả** | hạng của mình + top 3 | bảng xếp hạng |
| 7 | Bấm **Công bố người thắng** | người thắng thấy 3 hộp quà | 3 hộp quà |
| 8 | Người thắng chọn hộp | tên phần quà | hộp mở ra, tên quà chữ lớn |
| 9 | Bấm **Kết thúc phiên** | về màn hình chờ | về màn hình chờ |

Chỉ bàn điều khiển được đổi trạng thái. Điện thoại và máy chiếu chỉ đọc.

## Cách tính điểm

- Trả lời đúng: **1000 điểm** + thưởng tốc độ tối đa **500 điểm**, giảm dần đều
  theo thời gian đã dùng. Bấm ngay được 1500, bấm lúc gần hết giờ được ~1000.
- Trả lời sai hoặc không kịp: **0 điểm**.
- Đồng điểm thì ai có **tổng thời gian trả lời** ít hơn xếp trên.
- Bằng nhau cả hai thì cả hai cùng hạng nhất, và bàn điều khiển hiện danh sách
  để admin bấm chọn người nhận quà.

Chấm theo tốc độ là cố ý: một trận chỉ ~5 câu, nếu chấm 1 điểm/câu thì rất nhiều
người bằng điểm và không chọn ra được **một** người để trao quà.

## Ba hộp quà

Vị trí quà được xáo lại **mỗi lần công bố người thắng**, nên không ai đoán được
hộp nào có gì. Chỉ người thắng bấm được, và chỉ bấm được một lần.

Sửa danh sách quà ở [src/common/session/models/PrizeBoxes.js](../src/common/session/models/PrizeBoxes.js),
hằng `PRIZES`.

## Gặp sự cố

**Điện thoại khách bị tắt màn hình / lỡ refresh.** Mở lại đường dẫn là vào lại
đúng người cũ, giữ nguyên điểm — danh tính lưu ở `localStorage` của máy đó. Miễn
là họ không xoá dữ liệu trình duyệt hoặc đổi máy.

**Bấm "Câu tiếp" hai lần.** Không sao, máy trạng thái chặn lần thứ hai, không
nhảy mất câu nào.

**Quét QR ra trang lỗi.** Đường dẫn đang là `localhost`. Chạy `npm run dev:lan`
và mở lại tất cả màn hình bằng địa chỉ IP.

**Muốn bỏ trận đang chạy.** Bấm **Kết thúc phiên** ở bàn điều khiển, hoặc **Huỷ
phiên** khi còn ở phòng chờ. Mở phiên mới từ `#/admin` cũng tự huỷ phiên cũ.

**Xoá sạch dữ liệu.** Xoá `localStorage` của trang: hai khoá
`open-day-quiz:quizzes` và `open-day-quiz:session` (điện thoại người chơi thì là
`open-day-quiz:player`).

## Giới hạn hiện tại

Trạng thái phiên lưu ở `localStorage` nên **chỉ đồng bộ giữa các tab trên cùng
một máy**. Demo trọn kịch bản được ngay (admin một tab, display một tab, player
một tab), nhưng nhiều điện thoại thật chơi cùng lúc thì cần lớp realtime — xem
[plan.md](plan.md) mục 6.
