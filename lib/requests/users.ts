import { apiClient, type APIResponse } from "./client";
import { Invoice, Payment } from "./finances";

export interface UserProfile {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  other_name: string;
  full_name: string;
  gender: string;
  reg_number: string;
  date_of_birth: string;
  town_of_residence: string;
  county_of_residence: string;
  address: string;
  role_id: string;
  role_name: string;
  school_id: string;
  school_name: string;
  branches: Record<string, string>[];
  is_active: boolean;
  is_superuser: boolean;
  force_pass_reset: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  status: string;
  photo: string | null;
  
  // Guardians, Teachers, Admins and clerks
  id_number?: string;
  phone_number?: string;
  email?: string;

  // Students
  guardians?:  Record<string, string>[];
  knec_number?: string;
  nemis_number?: string;
  classroom_id?: string;
  classroom_name?: string;
  grade_level?: string;
  academic_year?: string;
  medical_info?: string;
  additional_info?: string;
  student_type?: string;
  subscribed_to_transport?: boolean;
  subscribed_to_meals?: boolean;
  admission_date?: string;
  invoices?: Invoice[];
  payments?: Payment[];

  // Guardians
  occupation?: string;

  // Teachers
  tsc_number?: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  other_name: string;
  date_of_birth?: string;
  gender?: string;
  reg_number?: string;
  student_type?: string;
  status?: string;
  knec_number?: string;
  town_of_residence?: string;
  county_of_residence?: string;
  address?: string;
  academic_year?: string;
  admission_date?: string;
  nemis_number?: string;
  classroom_id?: string | null;
  medical_info?: string;
  additional_info?: string;
  id_number?: string;
  phone_number?: string;
  email?: string;
  occupation?: string;
  tsc_number?: string;
  branch_ids?: string[];
  subscribed_to_meals?: boolean;
  subscribed_to_transport?: boolean;
  guardians?: Record<string, any>[];
  photo?: string;
}

export interface CreateUserResponse {
  id: string;
}

export interface UpdateUserRequest {
  first_name: string;
  last_name: string;
  other_name: string;
  date_of_birth?: string;
  gender?: string;
  reg_number?: string;
  student_type?: string;
  status?: string;
  knec_number?: string;
  town_of_residence?: string;
  county_of_residence?: string;
  address?: string;
  academic_year?: string;
  admission_date?: string;
  nemis_number?: string;
  classroom_id?: string | null;
  classroom_movement_type?: string;
  classroom_movement_reason?: string;
  medical_info?: string;
  additional_info?: string;
  id_number?: string;
  phone_number?: string;
  email?: string;
  occupation?: string;
  tsc_number?: string;
  branch_ids?: string[];
  subscribed_to_meals?: boolean;
  subscribed_to_transport?: boolean;
  guardians?: Record<string, any>[];
  photo?: string;
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
    return apiClient.post<UserProfile>(`/users/view/${userId}/`)
  },

  filterUsers: async (data: FilterUsersRequest): Promise<APIResponse<UserProfile[]>> => {
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
