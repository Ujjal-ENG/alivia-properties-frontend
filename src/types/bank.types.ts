export type Bank = {
  id: string
  name: string
  logoUrl?: string
  interestRate: number
  maxTenureYears: number
  maxLoanAmount: number
  minDownPaymentPct: number
  processingFeePct: number
  prepaymentPenaltyPct: number
  approvalDays: number
  rating: number
  popular: boolean
}
