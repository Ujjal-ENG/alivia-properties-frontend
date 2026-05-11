export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type ConsultationType =
  | 'buying'
  | 'investment'
  | 'project-specific'
  | 'site-visit'

export type Booking = {
  id: string
  consultationType: ConsultationType
  status: BookingStatus
  projectId?: string
  projectName?: string
  propertyId?: string
  propertyTitle?: string
  name: string
  email: string
  phone: string
  preferredDate: string
  preferredTime: string
  message?: string
  userId?: string
  assignedTo?: string
  createdAt: string
  confirmedAt?: string
}
