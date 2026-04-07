export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
};

export type RegisterResponse = {
  userId: number;
  email: string;
  message: string;
};

export type ProfileResponse = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
};

