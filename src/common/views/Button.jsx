const VARIANTS = {
  primary: 'bg-accent border-accent-border text-white',
  secondary: 'border-border text-text-h hover:border-accent-border',
  quiet: 'border-transparent text-text hover:border-border',
}

/**
 * The button used across the app. Three priority levels told apart by fill and
 * border rather than colour: primary is filled black, secondary is outline only,
 * quiet has no border.
 */
function Button({ variant = 'secondary', className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 font-medium transition enabled:cursor-pointer enabled:hover:opacity-85 enabled:active:scale-95 disabled:opacity-30 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
