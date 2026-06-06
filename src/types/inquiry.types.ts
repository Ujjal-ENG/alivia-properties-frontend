export type InquiryStatus = 'new' | 'read' | 'replied' | 'closed'

export type InquiryType = 'property' | 'project' | 'general' | 'report' | 'supplier' | 'investor'

export type Inquiry = {
  id: string
  type: InquiryType
  status: InquiryStatus
  propertyId?: string
  propertyTitle?: string
  propertySlug?: string
  projectId?: string
  projectName?: string
  projectSlug?: string
  name: string
  email: string
  phone: string
  message: string
  reply?: string
  sellerId?: string
  buyerId?: string
  createdAt: string
  repliedAt?: string
}
