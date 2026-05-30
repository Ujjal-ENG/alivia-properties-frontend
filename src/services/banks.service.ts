import type { Bank } from "@/types/bank.types"
import { httpClient } from "./http-client"

export type EmiCalculation = {
  emi: number
  totalPayment: number
  totalInterest: number
}

export const banksService = {
  list(): Promise<Bank[]> {
    return httpClient.get<Bank[]>("/banks")
  },

  calculateEmi(input: {
    principal: number
    annualRate: number
    tenureYears: number
  }): Promise<EmiCalculation> {
    return httpClient.post<EmiCalculation>("/banks/emi-calculate", input)
  },
}
