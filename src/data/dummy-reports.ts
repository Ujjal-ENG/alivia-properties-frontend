import type { ReportRecord } from "@/types/report.types"

export const DUMMY_REPORTS: ReportRecord[] = [
  {
    id: "report-001",
    propertyId: "prop-001",
    propertyTitle: "Elegant 3-Bedroom Apartment in Bashundhara R/A",
    reason: "Incorrect information",
    message: "Listing mentions two parking spaces but seller confirmed only one is available.",
    name: "Mahin Islam",
    email: "mahin@example.com",
    status: "new",
    createdAt: "2025-01-09T09:15:00Z",
  },
  {
    id: "report-002",
    propertyId: "prop-004",
    propertyTitle: "Spacious 4-Bedroom Apartment in Banani Block B",
    reason: "Wrong price",
    message: "Displayed price is lower than phone quote from seller.",
    name: "Sajid Karim",
    email: "sajid@example.com",
    status: "reviewed",
    createdAt: "2025-01-08T12:45:00Z",
  },
  {
    id: "report-003",
    propertyId: "prop-007",
    propertyTitle: "Retail Shop Space in Dhanmondi 27 — High Footfall",
    reason: "Property already sold/rented",
    message: "Property no longer available according to building caretaker.",
    name: "Nabila Jahan",
    email: "nabila@example.com",
    status: "resolved",
    createdAt: "2025-01-06T15:30:00Z",
  },
]
