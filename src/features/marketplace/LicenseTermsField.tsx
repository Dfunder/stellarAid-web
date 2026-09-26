import { useState } from 'react'
import { Input } from '@/components/ui'
import { LICENSE_PRESETS } from './EditListing'

interface LicenseTermsFieldProps {
  /** Current license terms value */
  value: string
  /** Callback when value changes */
  onChange: (value: string) => void
  /** Field label */
  label?: string
  /** Whether the field is required */
  required?: boolean
  /** Error message */
  error?: string
  /** Placeholder text */
  placeholder?: string
  /** Maximum length */
  maxLength?: number
}

/**
 * License and usage terms field with preset options and custom text area.
 *
 * Features:
 * - License presets (personal, commercial, exclusive) with descriptions
 * - Custom terms textarea for free-form terms
 * - Safe rendering (no HTML injection)
 * - Selected license persists with the listing
 */
export default function LicenseTermsField({
  value,
  onChange,
  label = 'License Terms',
  required = true,
  error,
  placeholder = 'Enter license terms...',
  maxLength = 10000,
}: LicenseTermsFieldProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(() => {
    return LICENSE_PRESETS.find((p) => p.value === value)?.value ?? null
  })
  const [isCustom, setIsCustom] = useState(() => {
    return !LICENSE_PRESETS.some((p) => p.value === value)
  })
  const [customTerms, setCustomTerms] = useState(() => {
    const preset = LICENSE_PRESETS.find((p) => p.value === value)
    return preset ? '' : value
  })

  const handlePresetChange = (presetValue: string) => {
    const preset = LICENSE_PRESETS.find((p) => p.value === presetValue)
    if (preset) {
      setSelectedPreset(presetValue)
      setIsCustom(false)
      setCustomTerms('')
      onChange(presetValue)
    }
  }

  const handleCustomChange = (text: string) => {
    setIsCustom(true)
    setSelectedPreset(null)
    setCustomTerms(text)
    onChange(text)
  }

  const effectiveValue = isCustom ? customTerms : (selectedPreset ?? '')

  return (
    <div className="space-y-4">
      <label className="block text-caption-sm font-medium text-foreground">
        {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
      </label>

      <fieldset className="rounded-control border border-line bg-surface p-4">
        <legend className="text-caption-sm font-medium text-foreground mb-3">
          Choose a license preset or write custom terms
        </legend>

        <div className="flex flex-wrap gap-2 mb-4">
          {LICENSE_PRESETS.map((preset) => (
            <label
              key={preset.value}
              className={`flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-caption-sm transition-colors ${
                selectedPreset === preset.value && !isCustom
                  ? 'bg-primary/10 text-primary border border-primary'
                  : 'bg-surface-muted text-foreground hover:bg-surface border border-line'
              }`}
            >
              <input
                type="radio"
                name="license-preset"
                value={preset.value}
                checked={selectedPreset === preset.value && !isCustom}
                onChange={() => handlePresetChange(preset.value)}
                className="h-4 w-4 accent-primary"
              />
              <span>{preset.label}</span>
            </label>
          ))}
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-caption-sm transition-colors ${
              isCustom
                ? 'bg-primary/10 text-primary border border-primary'
                : 'bg-surface-muted text-foreground hover:bg-surface border border-line'
            }`}
          >
            <input
              type="radio"
              name="license-preset"
              value="custom"
              checked={isCustom}
              onChange={() => {
                setIsCustom(true)
                setSelectedPreset(null)
              }}
              className="h-4 w-4 accent-primary"
            />
            <span>Custom terms</span>
          </label>
        </div>

        {selectedPreset && !isCustom && (
          <div className="mb-4 rounded-control bg-surface-muted p-3 text-caption-sm text-muted">
            {LICENSE_PRESETS.find((p) => p.value === selectedPreset)?.description}
          </div>
        )}

        <div>
          <label htmlFor="custom-terms" className="block text-caption-sm font-medium text-foreground mb-1">
            {isCustom ? 'Custom License Terms' : 'Edit Selected Preset'}
          </label>
          <textarea
            id="custom-terms"
            value={effectiveValue}
            onChange={(e) => handleCustomChange(e.target.value)}
            rows={4}
            className={`w-full rounded-control border border-line bg-background px-3 py-2 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${error ? 'border-danger' : ''}`}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={!isCustom && selectedPreset !== null}
          />
          <div className="mt-1 flex justify-between text-caption-xs text-muted">
            <span>{effectiveValue.length}/{maxLength} characters</span>
            {!isCustom && selectedPreset && (
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  setIsCustom(true)
                  setCustomTerms(selectedPreset ?? '')
                }}
              >
                Customize
              </button>
            )}
          </div>
          {error && <p className="mt-1 text-caption-sm text-danger">{error}</p>}
        </div>

        <p className="text-caption-xs text-muted">
          Terms are displayed to buyers before purchase and included on receipts.
          HTML is not allowed — terms will be rendered as plain text.
        </p>
      </fieldset>
    </div>
  )
}