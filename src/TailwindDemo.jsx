import { useState } from 'react'

const QUESTIONS = [
  {
    q: 'Tailwind v4 được nạp vào dự án Vite bằng cách nào?',
    options: [
      'Thêm plugin @tailwindcss/vite vào vite.config.js',
      'Khai báo trong postcss.config.cjs',
      'Chạy npx tailwindcss init -p',
      'Import CDN trong index.html',
    ],
    answer: 0,
  },
  {
    q: 'Design token được khai báo ở đâu trong Tailwind v4?',
    options: [
      'Trong theme.extend của tailwind.config.js',
      'Trong block @theme của file CSS',
      'Trong package.json',
      'Trong biến môi trường .env',
    ],
    answer: 1,
  },
  {
    q: 'Mặc định biến thể dark: dựa trên tín hiệu nào?',
    options: [
      'Class .dark trên thẻ html',
      'Thuộc tính data-theme',
      'Media query prefers-color-scheme',
      'localStorage',
    ],
    answer: 2,
  },
]

function TailwindDemo() {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)

  const current = QUESTIONS[step]
  const done = step >= QUESTIONS.length
  const progress = (step / QUESTIONS.length) * 100

  function choose(i) {
    if (picked !== null) return
    setPicked(i)
    if (i === current.answer) setScore((s) => s + 1)
  }

  function next() {
    setPicked(null)
    setStep((s) => s + 1)
  }

  function restart() {
    setStep(0)
    setPicked(null)
    setScore(0)
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-12 text-left">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase">
            Open Day
          </p>
          <h1 className="text-text-h !m-0 !text-3xl !tracking-tight">
            Quiz nhanh
          </h1>
        </div>
        <span className="border-accent-border bg-accent-bg text-accent font-mono rounded-full border px-3 py-1 text-sm">
          {score}/{QUESTIONS.length}
        </span>
      </header>

      <div className="bg-code-bg h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${done ? 100 : progress}%` }}
        />
      </div>

      {done ? (
        <section className="border-border bg-bg shadow-card flex flex-col items-center gap-4 rounded-2xl border p-10 text-center">
          <p className="text-5xl">{score === QUESTIONS.length ? '🎉' : '👏'}</p>
          <h2 className="text-text-h !m-0">
            Bạn đúng {score}/{QUESTIONS.length} câu
          </h2>
          <p className="text-sm">Toàn bộ trang này chỉ dùng class Tailwind.</p>
          <button
            type="button"
            onClick={restart}
            className="bg-accent mt-2 cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-85 active:scale-95"
          >
            Làm lại
          </button>
        </section>
      ) : (
        <section className="border-border bg-bg shadow-card flex flex-col gap-5 rounded-2xl border p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs">
              Câu {step + 1} / {QUESTIONS.length}
            </p>
            <h2 className="text-text-h !m-0 leading-snug">{current.q}</h2>
          </div>

          <ul className="flex flex-col gap-2.5">
            {current.options.map((opt, i) => {
              const isAnswer = i === current.answer
              const isPicked = i === picked
              const revealed = picked !== null

              let tone = 'border-border hover:border-accent-border hover:bg-accent-bg'
              if (revealed && isAnswer)
                tone = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              else if (revealed && isPicked)
                tone = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
              else if (revealed) tone = 'border-border opacity-50'

              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    disabled={revealed}
                    className={`flex w-full items-center gap-3 rounded-xl border bg-transparent px-4 py-3 text-left text-[15px] transition-colors duration-200 ${tone} ${
                      revealed ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <span className="border-border font-mono flex size-6 shrink-0 items-center justify-center rounded-md border text-xs">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {revealed && isAnswer && <span>✓</span>}
                    {revealed && isPicked && !isAnswer && <span>✕</span>}
                  </button>
                </li>
              )
            })}
          </ul>

          <button
            type="button"
            onClick={next}
            disabled={picked === null}
            className="bg-accent self-end rounded-lg px-5 py-2.5 text-sm font-medium text-white transition enabled:cursor-pointer enabled:hover:opacity-85 enabled:active:scale-95 disabled:opacity-30"
          >
            {step === QUESTIONS.length - 1 ? 'Xem kết quả' : 'Câu tiếp'}
          </button>
        </section>
      )}

      <p className="text-center text-xs opacity-60">
        Token từ <span className="font-mono">@theme</span> · dark mode tự đổi
        theo hệ điều hành
      </p>
    </main>
  )
}

export default TailwindDemo
