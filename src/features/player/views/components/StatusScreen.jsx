/** A waiting screen: one large icon, one headline, one supporting line. */
function StatusScreen({ icon: Icon, title, note }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <Icon className="text-text-h size-12" strokeWidth={1.5} aria-hidden="true" />
      <h2 className="text-text-h text-2xl">{title}</h2>
      {note && <p className="text-sm opacity-70">{note}</p>}
    </section>
  )
}

export default StatusScreen
