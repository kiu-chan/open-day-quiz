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

1. `npm run start`, ghi lại địa chỉ IP mà nó in ra (ví dụ `http://192.168.1.20:3000`).
2. Mở `#/admin` bằng địa chỉ đó, soạn bộ câu hỏi. Mọi thay đổi tự lưu, không có
   nút Lưu.
3. Mỗi câu đặt thời lượng riêng (5–120 giây). Câu dài, nhiều chữ thì cho nhiều
   thời gian hơn.
4. Bộ quiz phải "chơi được" mới mở phiên được: có tên, có ít nhất một câu, và mọi
   câu đều đủ nội dung + đáp án. Trang admin liệt kê thẳng chỗ còn thiếu.
5. Mở `#/display` trên máy chiếu, để nguyên đó.
6. Lấy một điện thoại quét thử QR trước khi khách đến — để phát hiện sớm nếu wifi
   chặn thiết bị nói chuyện với nhau (xem [installation.md](installation.md) mục mạng).

Bộ quiz lưu trong trình duyệt của máy admin, nên soạn ở máy nào thì mở phiên ở
đúng máy đó.

### Câu hỏi có ảnh

Mỗi câu hỏi thêm được một ảnh, và **mỗi đáp án cũng thêm được một ảnh** — làm được
câu kiểu "đây là toà nhà nào?" với bốn tấm ảnh để chọn. Bấm **Thêm ảnh** ở câu hỏi
hoặc ở từng dòng đáp án, chọn file jpg/png/webp/gif.

- Đáp án có ảnh thì **không bắt buộc có chữ**, và ngược lại. Câu hỏi cũng vậy.
- Ảnh được thu về cạnh dài 1200px ngay trên máy admin rồi mới gửi đi, nên chụp
  bằng điện thoại rồi kéo thẳng vào cũng được, không cần tự resize.
- Ảnh nằm trên **máy chủ** (`server/uploads/`), không nằm trong bộ quiz. Nên nếu
  đem bộ quiz sang máy khác (hoặc xoá thư mục đó) thì chỗ ảnh hiện "Ảnh không tải
  được" — soạn ảnh ở đúng máy sẽ chạy trận là an toàn nhất.
- Máy chủ phải đang chạy lúc soạn thì mới tải ảnh lên được.

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

**Khách khó quét QR?** Bấm vào mã QR — ở bàn điều khiển hoặc trên màn hình lớn —
để phóng nó ra kín màn hình. Bấm chỗ nào cũng được hoặc nhấn `Esc` để đóng.

Chỉ bàn điều khiển phát ra lệnh điều khiển. Điện thoại chỉ gửi đáp án và lượt chọn
hộp quà; máy chiếu chỉ đọc. Mọi thay đổi đi qua máy chủ nên ba màn hình luôn khớp
nhau — không có chuyện máy chiếu đang ở câu 3 mà điện thoại còn ở câu 2.

Hết giờ thì **máy chủ** tự chốt câu, không phải tab admin. Admin khoá màn hình hay
đóng tab giữa trận cũng không làm trận đấu treo; mở lại là thấy đúng trạng thái
hiện tại.

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
đúng người cũ, giữ nguyên điểm — danh tính lưu ở `localStorage` của máy đó, và
trang tự vào lại phiên không cần gõ tên. Miễn là họ không xoá dữ liệu trình duyệt
hoặc đổi máy.

**Điện thoại hiện băng đen "Mất kết nối tới máy chủ".** Máy đó rớt wifi, hoặc máy
chủ đã tắt. Không phải làm gì cả — trang tự nối lại và băng tự mất. Nếu cả phòng
đều hiện thì kiểm wifi của máy chạy máy chủ.

**Máy chủ bị tắt giữa trận (Ctrl+C, sập nguồn).** Trạng thái chỉ ở RAM nên trận
đang chạy mất luôn. Chạy lại `npm run serve`, mở phiên mới từ `#/admin`; điện thoại
khách tự vào lại phòng chờ, nhưng điểm của lượt cũ không lấy lại được.

**Bấm "Câu tiếp" hai lần.** Không sao, máy trạng thái chặn lần thứ hai, không
nhảy mất câu nào.

**Quét QR ra trang lỗi.** Hai khả năng: một là màn hình lớn đang mở bằng
`localhost` nên QR cũng trỏ `localhost` — mở lại bằng địa chỉ IP; hai là điện thoại
không vào cùng mạng với máy chủ, xem [installation.md](installation.md) mục mạng.

**Muốn bỏ trận đang chạy.** Bấm **Kết thúc phiên** ở bàn điều khiển, hoặc **Huỷ
phiên** khi còn ở phòng chờ. Mở phiên mới từ `#/admin` cũng tự huỷ phiên cũ.

**Xoá sạch dữ liệu.** Trận đấu: bấm **Kết thúc phiên**, hoặc khởi động lại máy
chủ. Bộ quiz: xoá khoá `open-day-quiz:quizzes` trong `localStorage` của máy admin.
Trên điện thoại khách, danh tính nằm ở khoá `open-day-quiz:player`.

## Giới hạn hiện tại

Mọi thiết bị phải ở **cùng mạng nội bộ** với máy chạy máy chủ — khách dùng 4G
không vào được. Trạng thái chỉ ở RAM, tắt máy chủ là mất trận đang chạy. Và chưa
có mật khẩu cho bàn điều khiển.

Muốn khách vào bằng 4G từ bất cứ đâu thì phải đổi transport sang Firebase/Supabase;
chỗ cần sửa là `SessionRepository`, xem [architecture.md](architecture.md).
