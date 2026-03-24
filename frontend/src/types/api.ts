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
  email: string
  message: string
}

export type Profile = {
  id: number
  fullName: string
  email: string
  phone: string
  avatar: string | null
  role: string | null
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

export type RentMachineResponse = {
  bookingId: number
  queued: boolean
  queuePosition: number | null
  sessionId: number | null
  pcId: number | null
  pcLocation: string | null
  specName: string
  startTime: string
  expectedEndTime: string
  totalPrice: number
  walletBalance: number
  status: string
  message: string
}

export type StartSessionResponse = {
  sessionId: number
  bookingId: number
  pcId: number
  pcLocation: string
  startedAt: string
  expectedEndTime: string | null
  remainingSeconds: number
  connectionInfo: string
  status: string
  message: string
}

export type ActiveSessionResponse = {
  sessionId: number
  bookingId: number
  pcId: number
  pcLocation: string
  startedAt: string
  expectedEndTime: string | null
  remainingSeconds: number
  warning15Minutes: boolean
  status: string
  message: string
}

export type EndSessionResponse = {
  sessionId: number
  bookingId: number
  endedAt: string
  noRefundApplied: boolean
  status: string
  message: string
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

export type AdminUserItem = {
  id: number
  fullName: string | null
  email: string
  phone: string | null
  role: string | null
  active: boolean | null
  verified: boolean | null
}

export type AdminPcItem = {
  pcId: number
  specId: number
  specName: string
  cpu: string | null
  gpu: string | null
  ram: number | null
  storage: number | null
  operatingSystem: string | null
  pricePerHour: number
  location: string
  status: string
}

export type AdminBookingItem = {
  bookingId: number
  userEmail: string
  specName: string
  pcId: number | null
  bookingType: string
  totalHours: number | null
  startTime: string
  endTime: string
  totalPrice: number
  status: string
  createdAt: string
}

export type AdminReviewItem = {
  reviewId: number
  bookingId: number
  pcId: number
  userEmail: string
  rating: number
  comment: string
  status: string
  createdAt: string
}

export type AdminUserPaymentItem = {
  transactionId: number
  walletId: number | null
  userId: number
  userEmail: string
  userFullName: string | null
  amount: number
  type: string | null
  referenceId: number | null
  note: string | null
  createdAt: string
}
