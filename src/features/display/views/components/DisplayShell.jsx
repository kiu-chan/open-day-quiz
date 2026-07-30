/**
 * Khung màn hình lớn: chiếm hết màn hình, chữ to, không có gì để bấm.
 * `header` là thanh trên (số câu, đồng hồ), phần còn lại căn giữa.
 */
function DisplayShell({ header, children }) {
  return (
    <main className="flex flex-1 flex-col gap-8 px-8 py-8 lg:px-16">
      {header && (
        <header className="border-border flex items-center justify-between gap-6 border-b-2 pb-4">
          {header}
        </header>
      )}

      <div className="flex flex-1 flex-col justify-center gap-8">{children}</div>
    </main>
  )
}

export default DisplayShell
