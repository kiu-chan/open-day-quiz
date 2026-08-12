/** One building on the plan: a big letter, its icon and what is inside. */
function CampusBlock({ building, selected, onSelect }) {
  const { id, letter, name, subtitle, Icon } = building

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={selected}
      className={`bg-code-bg hover:border-accent-border hover:shadow-card group flex w-full cursor-pointer flex-col items-center gap-1 rounded-2xl px-4 py-8 text-center transition duration-300 hover:-translate-y-1 sm:py-12 ${
        selected ? 'border-accent-border border-4' : 'border-border border-2'
      }`}
    >
      <span className="text-text-h font-heading text-5xl leading-none font-bold sm:text-6xl">
        {letter}
      </span>
      <span className="text-text-h mt-2 inline-flex items-center gap-1.5 text-base font-semibold sm:text-lg">
        <Icon
          className="size-5 shrink-0 transition duration-300 group-hover:scale-110"
          strokeWidth={2}
          aria-hidden="true"
        />
        {name}
      </span>
      <span className="text-sm sm:text-base">{subtitle}</span>
    </button>
  )
}

export default CampusBlock
