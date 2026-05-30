export type EmploymentType =
  | "salaried"
  | "business-owner"
  | "freelancer"
  | "government-service"
  | "expat"
  | "other"

export type PreApprovalRequest = {
  id: string
  userId: string
  fullName: string
  email: string
  phone: string
  monthlyIncome: number
  monthlyExpenses?: number | null
  employmentType: string
  employerName?: string | null
  yearsEmployed?: number | null
  downPayment: number
  loanAmount: number
  tenureYears: number
  creditScore?: number | null
  approved: boolean
  approvedAmount?: number | null
  emi?: number | null
  dti?: number | null
  notes?: string | null
  createdAt: string
  updatedAt?: string
}
