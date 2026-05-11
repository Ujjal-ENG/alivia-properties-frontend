export type DocumentType =
  | 'title_deed'
  | 'mutation'
  | 'tax_receipt'
  | 'approval_plan'
  | 'noc'
  | 'survey_report'
  | 'utility_bill'
  | 'agreement'
  | 'other'

export type PropertyDocument = {
  id: string
  propertyId: string
  type: DocumentType
  label: string
  fileUrl: string
  fileSize: number
  mimeType: string
  isVerified: boolean
  uploadedAt: string
}
