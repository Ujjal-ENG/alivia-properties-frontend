"use client"

import { useMemo, useState } from "react"
import { formatPrice } from "@/utils/format-price"

interface MortgageCalculatorProps {
  propertyPrice: number
}

export function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [years, setYears] = useState(20)
  const [interestRate, setInterestRate] = useState(9.5)

  const loanDetails = useMemo(() => {
    const downPayment = propertyPrice * (downPaymentPercent / 100)
    const principal = propertyPrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const months = years * 12
    const monthlyPayment =
      monthlyRate === 0
        ? principal / months
        : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1)

    return {
      downPayment,
      principal,
      monthlyPayment,
    }
  }, [downPaymentPercent, years, interestRate, propertyPrice])

  return (
    <div className="surface-card p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-brand-700">Mortgage Estimate</p>
      <h3 className="mt-2 text-lg font-semibold text-ink-900">Plan financing quickly</h3>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-ink-700">Down Payment: {downPaymentPercent}%</span>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={downPaymentPercent}
            onChange={(event) => setDownPaymentPercent(Number(event.target.value))}
            className="mt-2 w-full"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Loan Tenure (Years)</span>
            <input
              type="number"
              min={1}
              max={30}
              value={years}
              onChange={(event) => setYears(Number(event.target.value))}
              className="mt-2 w-full rounded-[1rem] border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink-700">Interest Rate (%)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={interestRate}
              onChange={(event) => setInterestRate(Number(event.target.value))}
              className="mt-2 w-full rounded-[1rem] border border-border px-3 py-2 text-sm"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1rem] bg-ink-50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Down Payment</p>
          <p className="mt-2 text-sm font-semibold text-ink-900">{formatPrice(loanDetails.downPayment, true)}</p>
        </div>
        <div className="rounded-[1rem] bg-ink-50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-500">Loan Amount</p>
          <p className="mt-2 text-sm font-semibold text-ink-900">{formatPrice(loanDetails.principal, true)}</p>
        </div>
        <div className="rounded-[1rem] bg-brand-50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-brand-700">Monthly Estimate</p>
          <p className="mt-2 text-sm font-semibold text-brand-800">{formatPrice(Math.round(loanDetails.monthlyPayment))}/mo</p>
        </div>
      </div>
    </div>
  )
}
