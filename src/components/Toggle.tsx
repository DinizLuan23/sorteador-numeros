import { clsx } from 'clsx'

type ToggleProps = {
  checked: boolean
  onChange: (val: boolean) => void
  label?: string
  description?: string
}

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <span className="pt-0.5">
        <span
          className={clsx(
            'switch',
            checked ? 'bg-brand-600' : 'bg-gray-300'
          )}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span
            className={clsx(
              'dot',
              'translate-x-1',
              checked && 'translate-x-6'
            )}
          />
        </span>
      </span>
      {(label || description) && (
        <span>
          {label && <span className="label">{label}</span>}
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </span>
      )}
    </label>
  )
}
