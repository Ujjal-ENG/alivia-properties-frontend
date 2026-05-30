export type ReportStatus = "open" | "reviewed" | "resolved"

export type Report = {
  id: string
  propertyId: string
  propertyTitle?: string
  reason: string
  name: string
  email: string
  message?: string
  status: ReportStatus
  createdAt: string
}

export const DUMMY_REPORTS: Report[] = [
  {
    id: "rpt-1",
    propertyId: "prop-3",
    propertyTitle: "3 Bed Apartment, Mirpur 10",
    reason: "Already sold or rented",
    name: "Karim Hossain",
    email: "karim@example.com",
    message: "This flat was sold 2 months ago but is still showing as available.",
    status: "open",
    createdAt: "2024-06-12T10:20:00.000Z",
  },
  {
    id: "rpt-2",
    propertyId: "prop-7",
    propertyTitle: "Commercial Space, Motijheel",
    reason: "Incorrect information",
    name: "Fariha Begum",
    email: "fariha@example.com",
    message: "The listed price is ৳80 lakh but the actual asking price is ৳1.2 crore.",
    status: "reviewed",
    createdAt: "2024-06-18T14:05:00.000Z",
  },
  {
    id: "rpt-3",
    propertyId: "prop-2",
    propertyTitle: "Plot, Bashundhara R/A",
    reason: "Suspected fraud",
    name: "Jahangir Alam",
    email: "jahangir@example.com",
    message: "Seller is asking for advance money via bKash without any site visit — suspicious.",
    status: "open",
    createdAt: "2024-06-22T09:30:00.000Z",
  },
  {
    id: "rpt-4",
    propertyId: "prop-9",
    propertyTitle: "2 Bed Apartment, Uttara Sector 7",
    reason: "Duplicate listing",
    name: "Sultana Parvin",
    email: "sultana@example.com",
    status: "resolved",
    createdAt: "2024-07-01T11:45:00.000Z",
  },
  {
    id: "rpt-5",
    propertyId: "prop-11",
    propertyTitle: "Office Floor, Gulshan 1",
    reason: "Inappropriate content",
    name: "Rashed Khan",
    email: "rashed@example.com",
    message: "Listing photos contain unrelated promotional material for another business.",
    status: "open",
    createdAt: "2024-07-08T16:10:00.000Z",
  },
]
