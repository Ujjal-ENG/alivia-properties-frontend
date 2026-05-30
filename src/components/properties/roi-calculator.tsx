"use client"

import { TrendingUp } from "lucide-react"
import { useState } from "react"

function formatBdt(amount: number): string {
  if (amount >= 10_000_000) return `৳${(amount / 10_000_000).toFixed(2)} Cr`
  if (amount >= 100_000) return `৳${(amount / 100_000).toFixed(2)} L`
  return `৳${Math.round(amount).toLocaleString("en-BD")}`
}

export function RoiCalculator({ propertyPrice }: { propertyPrice: number }) {
  const [monthlyRent, setMonthlyRent] = useState(Math.round(propertyPrice * 0.004))
  const [annualExpensesPct, setAnnualExpensesPct] = useState(2)
  const [appreciationPct, setAppreciationPct] = useState(5)
  const [years, setYears] = useState(10)

  const annualRent = monthlyRent * 12
  const annualExpenses = (propertyPrice * annualExpensesPct) / 100
  const grossYield = (annualRent / propertyPrice) * 100
  const netYield = ((annualRent - annualExpenses) / propertyPrice) * 100
  const futureValue = propertyPrice * Math.pow(1 + appreciationPct / 100, years)
  const totalRentReceived = annualRent * years
  const totalReturn = futureValue + totalRentReceived - propertyPrice
  const breakEvenYears = annualRent > annualExpenses
    ? propertyPrice / (annualRent - annualExpenses)
    : Infinity

  return (
    <div className="surface-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
          <TrendingUp className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-h3">ROI Calculator</h3>
          <p className="text-xs text-ink-500">Estimate yield, appreciation, and total return</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SliderInput
          label="Monthly rent estimate"
          value={monthlyRent}
          onChange={setMonthlyRent}
          min={5_000}
          max={Math.max(monthlyRent * 2, 200_000)}
          step={1_000}
          format={(v) => `৳${v.toLocaleString("en-BD")}`}
        />
        <SliderInput
          label="Annual expenses"
          value={annualExpensesPct}
          onChange={setAnnualExpensesPct}
          min={0}
          max={10}
          step={0.25}
          format={(v) => `${v}% / yr`}
        />
        <SliderInput
          label="Annual appreciation"
          value={appreciationPct}
          onChange={setAppreciationPct}
          min={0}
          max={15}
          step={0.5}
          format={(v) => `${v}% / yr`}
        />
        <SliderInput
          label="Holding period"
          value={years}
          onChange={setYears}
          min={1}
          max={25}
          step={1}
          format={(v) => `${v} yrs`}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat label="Gross yield" value={`${grossYield.toFixed(2)}%`} />
        <Stat label="Net yield" value={`${netYield.toFixed(2)}%`} />
        <Stat label="Total return" value={formatBdt(totalReturn)} />
        <Stat
          label="Break-even"
          value={breakEvenYears === Infinity ? "—" : `${breakEvenYears.toFixed(1)} yrs`}
        />
      </div>
    </div>
  )
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  format: (v: number) => string
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-600">{label}</span>
        <span className="text-xs font-semibold text-ink-900">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
    </label>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] bg-ink-50 p-3 text-center">
      <p className="text-[0.65rem] uppercase tracking-[0.18em] text-ink-500">{label}</p>
      <p className="mt-1.5 text-sm font-bold text-brand-700">{value}</p>
    </div>
  )
}
