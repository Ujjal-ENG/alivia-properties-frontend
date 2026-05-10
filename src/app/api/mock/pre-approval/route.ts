import { type NextRequest } from "next/server"
import { created, badRequest } from "@/app/api/_utils/api-response"
import { preApprovalSchema } from "@/schemas/pre-approval.schema"
import { DUMMY_BANKS } from "@/data/dummy-banks"
import type { PreApprovalRequest } from "@/types/pre-approval.types"

function calcEmi(principal: number, annualRatePct: number, tenureYears: number): number {
  const r = annualRatePct / 12 / 100
  const n = tenureYears * 12
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export async function POST(request: NextRequest) {
  await new Promise((r) => setTimeout(r, 250))
  const body = await request.json()
  const parsed = preApprovalSchema.safeParse(body)
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Validation failed")
  const d = parsed.data
  const bank = DUMMY_BANKS.find(b => b.id === d.bankPreferenceId) ?? DUMMY_BANKS[0]
  const emi = Math.round(calcEmi(d.desiredLoanAmount, bank.interestRate, d.desiredTenureYears))
  const dti = (d.existingEmiTotal + emi) / d.monthlyIncome
  const status: PreApprovalRequest["status"] = dti < 0.5 ? "approved" : "rejected"
  const result: PreApprovalRequest = {
    id: `pa-${Date.now()}`,
    fullName: d.fullName,
    email: d.email,
    phone: d.phone,
    monthlyIncome: d.monthlyIncome,
    employmentType: d.employmentType,
    yearsEmployed: d.yearsEmployed,
    existingEmiTotal: d.existingEmiTotal,
    desiredLoanAmount: d.desiredLoanAmount,
    desiredTenureYears: d.desiredTenureYears,
    bankPreferenceId: bank.id,
    status,
    estimatedRate: bank.interestRate,
    estimatedEmi: emi,
    createdAt: new Date().toISOString(),
  }
  return created(result, status === "approved" ? "Pre-approved" : "Did not qualify")
}
