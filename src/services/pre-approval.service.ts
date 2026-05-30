import type { PreApprovalRequest } from "@/types/pre-approval.types"
import { httpClient } from "./http-client"

export const preApprovalService = {
  submit(
    payload: {
      fullName: string
      email: string
      phone: string
      monthlyIncome: number
      monthlyExpenses?: number
      employmentType: string
      employerName?: string
      yearsEmployed?: number
      downPayment: number
      loanAmount: number
      tenureYears: number
      creditScore?: number
    },
    token?: string,
  ): Promise<PreApprovalRequest> {
    return httpClient.post<PreApprovalRequest>("/pre-approval", payload, { token })
  },

  mine(token?: string): Promise<PreApprovalRequest> {
    return httpClient.get<PreApprovalRequest>("/pre-approval/me", { token })
  },
}
