export type ApiEnvelope<T> = {
  success: boolean
  data: T
  message: string | null
  timestamp: string
}

export type Paged<T> = {
  content: T[]
  number: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresAt: string
}

export type RegisterResponse = {
  userId: number
  verificationToken: string
  message: string
}

export type Profile = {
  id: number
  fullName: string
  email: string
  phone: string
  avatar: string | null
}

export type MachineListItem = {
  pcId: number
  specId: number
  specName: string
  cpu: string
  gpu: string
  ram: number
  storage: number
  hourlyPrice: number
  location: string
  status: string
}

export type SubscriptionPlanPrice = {
  id: number
  planName: string
  durationDays: number
  price: number
}

export type ReviewSummary = {
  rating: number
  comment: string
  createdAt: string
}

export type MachineDetail = {
  pcId: number
  specId: number
  specName: string
  cpu: string
  gpu: string
  ram: number
  storage: number
  operatingSystem: string
  description: string
  hourlyPrice: number
  location: string
  plans: SubscriptionPlanPrice[]
  approvedReviews: ReviewSummary[]
}

export type WalletSummary = {
  walletId: number
  balance: number
}

export type WalletTransaction = {
  id: number
  amount: number
  type: string
  referenceId: number | null
  note: string | null
  createdAt: string
}

export type TopUpResponse = {
  paymentProvider: string
  status: string
  message: string
  orderId: string
  approvalUrl: string
}

export type PaypalCaptureResponse = {
  orderId: string
  status: string
  message: string
  balance: number
}

export type BookingResponse = {
  bookingId: number
  pcId: number | null
  specName: string | null
  bookingType: string | null
  totalHours: number | null
  startTime: string
  endTime: string
  totalPrice: number
  status: string
}

export type BookingPaymentResponse = {
  bookingId: number
  status: string
  walletBalance: number
}

export type BookingHistoryItem = {
  bookingId: number
  pcId: number | null
  specName: string | null
  totalHours: number | null
  startTime: string
  endTime: string
  totalPrice: number
  status: string
  remainingMinutes: number | null
  createdAt: string
}

export type ReviewSubmitResponse = {
  reviewId: number
  status: string
  message: string
}
