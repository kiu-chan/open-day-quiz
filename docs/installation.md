# Hướng dẫn cài đặt

## Cần có sẵn

| Thứ | Phiên bản | Ghi chú |
| --- | --- | --- |
| Node.js | 20.19+ hoặc 22.12+ | Vite 8 không chạy trên bản cũ hơn |
| npm | đi kèm Node | |
| Trình duyệt | Chrome / Edge / Safari bản mới | Cần `localStorage` |

Không cần server, không cần database, không cần biến môi trường. Toàn bộ dữ liệu
nằm trong `localStorage` của trình duyệt.

## Cài

```bash
git clone <địa-chỉ-repo>
cd open-day-quiz
npm install
```

## Chạy

```bash
npm run dev       # mở http://localhost:5173
```

Muốn điện thoại vào được thì phải chạy bản mở ra mạng LAN:

```bash
npm run dev:lan   # Vite in ra thêm dòng "Network: http://192.168.x.x:5173"
```

Dùng đúng địa chỉ `Network` đó cho **mọi** màn hình (kể cả máy chiếu). Nếu mở
trang bằng `localhost` thì mã QR sinh ra cũng trỏ tới `localhost`, và điện thoại
sẽ không vào được.

## Lệnh khác

```bash
npm run build     # build production vào dist/
npm run preview   # xem thử bản build
npm run lint      # oxlint
```

## Đem đi chạy thật

Bản build là web tĩnh, `dist/` bỏ lên bất cứ static host nào cũng chạy
(Netlify, Vercel, GitHub Pages, hoặc `npx serve dist`). Router dùng `location.hash`
nên **không cần cấu hình SPA fallback** — mọi đường dẫn vẫn là `index.html`.

## Giới hạn cần biết trước

Trạng thái phiên chơi hiện lưu ở `localStorage`, nên nó chỉ đồng bộ giữa các tab
**trên cùng một máy**. Nhiều điện thoại chơi cùng lúc thì cần lớp realtime —
xem [plan.md](plan.md) mục 6, việc còn phải chốt.
