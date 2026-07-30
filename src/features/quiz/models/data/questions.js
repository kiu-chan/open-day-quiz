// Nguồn dữ liệu thô. Đổi sang API/CMS thì chỉ cần sửa QuestionRepository,
// phần còn lại của app không bị ảnh hưởng.
export const QUESTION_DATA = [
  {
    id: 'tw-vite-plugin',
    prompt: 'Tailwind v4 được nạp vào dự án Vite bằng cách nào?',
    options: [
      'Thêm plugin @tailwindcss/vite vào vite.config.js',
      'Khai báo trong postcss.config.cjs',
      'Chạy npx tailwindcss init -p',
      'Import CDN trong index.html',
    ],
    correctIndex: 0,
  },
  {
    id: 'tw-theme-block',
    prompt: 'Design token được khai báo ở đâu trong Tailwind v4?',
    options: [
      'Trong theme.extend của tailwind.config.js',
      'Trong block @theme của file CSS',
      'Trong package.json',
      'Trong biến môi trường .env',
    ],
    correctIndex: 1,
  },
  {
    id: 'tw-dark-variant',
    prompt: 'Mặc định biến thể dark: dựa trên tín hiệu nào?',
    options: [
      'Class .dark trên thẻ html',
      'Thuộc tính data-theme',
      'Media query prefers-color-scheme',
      'localStorage',
    ],
    correctIndex: 2,
  },
]
