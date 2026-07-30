// Bộ quiz mẫu, nạp sẵn lần đầu để có cái đem demo ngay.
// Nội dung thật cho Open Day do trường soạn — sửa trực tiếp trong trang admin.
export const QUIZ_DATA = [
  {
    id: 'quiz-mau',
    title: 'Bộ quiz mẫu',
    questions: [
      {
        id: 'q-open-day',
        prompt: 'Open Day của trường là dịp để làm gì?',
        options: [
          'Tham quan trường và tìm hiểu ngành học',
          'Thi tuyển sinh chính thức',
          'Nộp học phí',
          'Nhận bằng tốt nghiệp',
        ],
        correctIndex: 0,
        durationSeconds: 20,
      },
      {
        id: 'q-fablab',
        prompt: 'FabLab là loại không gian gì?',
        options: [
          'Phòng chế tạo, nơi tự làm ra sản phẩm mẫu',
          'Thư viện sách giấy',
          'Phòng họp của ban giám hiệu',
          'Sân vận động',
        ],
        correctIndex: 0,
        durationSeconds: 20,
      },
      {
        id: 'q-3d-print',
        prompt: 'Máy in 3D tạo ra vật thể bằng cách nào?',
        options: [
          'Đắp vật liệu thành từng lớp',
          'Cắt gọt từ một khối đặc',
          'Đúc trong khuôn kim loại',
          'Thổi thuỷ tinh nóng',
        ],
        correctIndex: 0,
        durationSeconds: 20,
      },
      {
        id: 'q-qr',
        prompt: 'Mã QR khác mã vạch thường ở điểm nào?',
        options: [
          'Lưu dữ liệu theo cả hai chiều nên chứa được nhiều hơn',
          'Chỉ đọc được bằng máy chuyên dụng',
          'Không lưu được chữ, chỉ lưu số',
          'Phải in màu mới quét được',
        ],
        correctIndex: 0,
        durationSeconds: 20,
      },
      {
        id: 'q-robot',
        prompt: 'Cảm biến siêu âm trên robot dùng để làm gì?',
        options: [
          'Đo khoảng cách tới vật cản',
          'Đo nhiệt độ động cơ',
          'Phát nhạc',
          'Sạc pin',
        ],
        correctIndex: 0,
        durationSeconds: 15,
      },
    ],
  },
]
