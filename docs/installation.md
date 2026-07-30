# Hướng dẫn cài đặt

## Cần có sẵn

| Thứ | Phiên bản | Ghi chú |
| --- | --- | --- |
| Node.js | 20.19+ hoặc 22.12+ | Vite 8 không chạy trên bản cũ hơn |
| npm | đi kèm Node | |
| Trình duyệt | Chrome / Edge / Safari bản mới | Cần `localStorage` và `EventSource` |
| Wifi | máy tính và điện thoại **cùng một mạng** | xem mục cuối |

Không cần database, không cần biến môi trường, không cần internet. Máy chủ trận
đấu là một tiến trình Node đi kèm repo, không thêm dependency nào.

## Cài

```bash
git clone <địa-chỉ-repo>
cd open-day-quiz
npm install
```

## Chạy khi làm việc

```bash
npm run dev       # http://localhost:5173, chỉ máy này vào được
```

API phiên chơi cắm sẵn vào dev server, nên không phải mở thêm tiến trình nào.

## Chạy thật (điện thoại quét QR vào chơi)

```bash
npm run start     # build rồi chạy máy chủ ở cổng 3000
```

Nó in ra sẵn ba đường dẫn:

```
Máy chủ trận đấu đang chạy.

  Bàn điều khiển   http://192.168.1.20:3000/#/admin
  Màn hình lớn     http://192.168.1.20:3000/#/display
  Người chơi       http://192.168.1.20:3000/#/play
```

Dùng đúng địa chỉ IP đó cho **mọi** màn hình, kể cả máy chiếu: mã QR sinh ra từ
địa chỉ đang mở, nên nếu mở bằng `localhost` thì QR cũng trỏ tới `localhost` và
điện thoại không vào được.

Đổi cổng: `PORT=8080 npm run serve` (dùng `serve` khi đã build sẵn, khỏi build lại).

Muốn vừa sửa code vừa cho điện thoại vào thì `npm run dev:lan` cũng chạy được —
vẫn có HMR, vẫn là máy chủ thật, chỉ ở cổng 5173.

## Lệnh khác

```bash
npm run build     # build production vào dist/
npm run serve     # chạy máy chủ với dist/ đã build
npm run preview   # xem thử bản build bằng Vite
npm run lint      # oxlint
```

## Mạng: điều kiện bắt buộc

Điện thoại và máy chạy máy chủ phải **nói chuyện được với nhau trong mạng nội bộ**.
Không cần internet — dữ liệu không ra khỏi phòng.

"Cùng wifi" là điều kiện cần nhưng chưa đủ:

| Tình huống | Chạy được? |
| --- | --- |
| Laptop cắm dây LAN, điện thoại wifi, cùng một router | ✅ |
| Hotspot phát từ một điện thoại, laptop và khách vào chung | ✅ — phương án dự phòng gọn nhất |
| Cùng tên wifi nhưng khách vào mạng "Guest" | ❌ khác subnet |
| Router bật client isolation (hay gặp ở wifi khách hội trường) | ❌ cùng mạng vẫn không thấy nhau |
| Khách dùng 4G, không vào wifi | ❌ |

Thử trước, mất 30 giây: chạy `npm run start`, lấy điện thoại (đã vào wifi đó) mở
đường dẫn `#/play` mà máy chủ in ra. Trang hiện ra là xong.

Không vào được thì lần lượt:

1. **Firewall macOS** — lần đầu chạy, macOS hỏi "Do you want the application node
   to accept incoming connections?", phải bấm **Allow**. Đây là chỗ hay quên nhất.
2. **Client isolation** trên router. Không sửa được thì phát hotspot từ điện thoại
   khác, hoặc mang theo một router du lịch riêng.
3. Dùng **địa chỉ IP**, đừng dùng `tên-máy.local` — mDNS trên Android khá bập bõm.

HTTP (không HTTPS) là bình thường ở đây: khách quét QR bằng app camera của điện
thoại, không phải gõ địa chỉ, nên cảnh báo "không bảo mật" không xuất hiện.

## Đem lên internet thì sao

Được, nhưng phải đổi transport: máy chủ này giữ trạng thái trong RAM của một tiến
trình, hợp với một cái máy trong một cái phòng. Muốn chạy trên hosting thì thay
`server/` bằng Firebase/Supabase và sửa `SessionRepository` — xem
[architecture.md](architecture.md) mục realtime.

`dist/` là web tĩnh nên vẫn bỏ lên static host được, nhưng khi đó không có máy chủ
phiên và ba màn hình sẽ không đồng bộ với nhau.

## Giới hạn cần biết trước

Trạng thái trận đấu chỉ ở RAM: **tắt máy chủ giữa trận là mất trận đang chạy**. Mở
lại rồi mở phiên mới — điện thoại của khách tự vào lại vì tên đã lưu trong máy họ.

Ai biết địa chỉ cũng mở được `#/admin/live` và điều khiển trận đấu. Ở hội trường
thì chấp nhận được (mã QR chỉ trỏ tới `#/play`), nhưng đừng công bố đường dẫn admin.
