import { apiClient, type APIResponse } from "./client";
import { UserProfile } from "./users";

export interface LoginRequest {
  credential: string;
  password: string;
}

export interface AuthResponse {
  identity_status: string;
  user_profile: UserProfile | null;
}

export interface VerifyLoginOTPRequest {
  code: string;
  purpose?: string;
}

export const authRequests = {
  login: async (credentials: LoginRequest): Promise<APIResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>("/auth/login/", credentials)
  },

  logout: async (): Promise<APIResponse<void>> => {
    return apiClient.post<void>("/auth/logout/", {})
  },

  verifyLoginOTP: async (data: VerifyLoginOTPRequest): Promise<APIResponse<AuthResponse>> => {
    return apiClient.post<AuthResponse>("/otps/verify/", {...data, purpose: "TWO_FACTOR_AUTHENTICATION"})
  },

  resendLoginOTP: async (): Promise<APIResponse<void>> => {
    return apiClient.post<void>("/otps/send/", {purpose: "TWO_FACTOR_AUTHENTICATION", delivery_method: "EMAIL"})
  },
};
