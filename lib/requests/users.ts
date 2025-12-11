import { apiClient, type APIResponse } from "./client";

export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  other_name: string;
  gender: string;
  reg_number: string;
  date_of_birth: string;
  role_id: string;
  role_name: string;
  branch_id: string;
  branch_name: string;
  is_active: boolean;
  is_superuser: boolean;
  force_pass_reset: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  
  // Guardians, Teachers, Admins and clerks
  id_number?: string;
  phone_number?: string;
  email?: string;

  // Students
  knec_number?: string;
  nemis_number?: string;
  classroom_id?: string;
  classroom_name?: string;
  medical_info?: string;
  additional_info?: string;

  // Guardians
  occupation?: string;

  // Teachers
  tsc_number?: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  reg_number?: string;
  knec_number?: string;
  nemis_number?: string;
  classroom_id?: string;
  medical_info?: string;
  additional_info?: string;
  id_number?: string;
  phone_number?: string;
  email?: string;
  occupation?: string;
  tsc_number?: string;
}

export interface CreateUserResponse {
  id: string;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  reg_number?: string;
  knec_number?: string;
  nemis_number?: string;
  classroom_id?: string;
  medical_info?: string;
  additional_info?: string;
  id_number?: string;
  phone_number?: string;
  email?: string;
  occupation?: string;
  tsc_number?: string;
  branch_id?: string;
}

export interface FilterUsersRequest {
  search?: string;
  role_name?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: string;
  reg_number?: string;
  knec_number?: string;
  nemis_number?: string;
  classroom_id?: string;
  medical_info?: string;
  additional_info?: string;
  id_number?: string;
  phone_number?: string;
  email?: string;
  occupation?: string;
  tsc_number?: string;
}

export interface ForgotPasswordRequest {
  credential: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface AddGuardianRequest {
  guardian_id: string;
  relationship: string;
  is_primary?: boolean;
  can_receive_reports?: boolean;
}

export interface AddGuardianResponse {
  id: string;
}

export interface Guardian {
  guardian_id: string;
  guardian_name: string;
  relationship: string;
  is_primary: boolean;
  can_receive_reports: boolean;
}

export const usersRequests = {
  createUser: async (roleName: string, data: CreateUserRequest): Promise<APIResponse<CreateUserResponse>> => {
    return apiClient.post<CreateUserResponse>(`/users/create/${roleName}/`, data);
  },

  updateUser: async (userId: string, data: UpdateUserRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/users/update/${userId}/`, data)
  },

  deleteUser: async (userId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/users/delete/${userId}/`)
  },

  getUser: async (userId: string): Promise<APIResponse<UserProfile>> => {
    return apiClient.post<UserProfile>(`/users/${userId}/`)
  },

  filterUsers: async (userId: string, data: FilterUsersRequest): Promise<APIResponse<UserProfile[]>> => {
    return apiClient.post<UserProfile[]>(`/users/filter/`, data)
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/users/forgot-password/`, data)
  },

  resetPassword: async (userId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/users/reset-password/${userId}/`)
  },

  changePassword: async (data: ChangePasswordRequest): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/users/change-password/`, data)
  },

  addGuardian: async (studentId: string, guardianId: string, data: AddGuardianRequest): Promise<APIResponse<AddGuardianResponse>> => {
    return apiClient.post<AddGuardianResponse>(`/users/students/${studentId}/guardians/add/`)
  },

  removeGuardian: async (studentId: string, guardianId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/users/students/${studentId}/guardians/${guardianId}/remove/`)
  },

  listGuardians: async (studentId: string): Promise<APIResponse<Guardian[]>> => {
    return apiClient.post<Guardian[]>(`/users/students/${studentId}/guardians/`)
  },
};
