import { Award, Trophy } from 'lucide-react'

function ResultCard({ score, total, isPerfect, onRestart }) {
  const Icon = isPerfect ? Trophy : Award

  return (
    <section className="border-border bg-bg shadow-card flex flex-col items-center gap-4 rounded-2xl border p-10 text-center">
      <Icon
        className="text-text-h size-12"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <h2 className="text-text-h text-2xl">
        Bạn đúng {score}/{total} câu
      </h2>
      <p className="text-sm">Toàn bộ trang này chỉ dùng class Tailwind.</p>
      <button
        type="button"
        onClick={onRestart}
        className="bg-accent mt-2 cursor-pointer rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-85 active:scale-95"
      >
        Làm lại
      </button>
    </section>
  )
}

export default ResultCard
