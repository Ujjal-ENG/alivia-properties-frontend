export type InquiryStatus = 'new' | 'read' | 'replied' | 'closed'

export type InquiryType = 'property' | 'project' | 'general' | 'report'

export type Inquiry = {
  id: string
  type: InquiryType
  status: InquiryStatus
  propertyId?: string
  propertyTitle?: string
  projectId?: string
  projectName?: string
  name: string
  email: string
  phone: string
  message: string
  sellerId?: string
  buyerId?: string
  createdAt: string
  repliedAt?: string
}
