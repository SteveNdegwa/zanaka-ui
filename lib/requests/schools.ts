import { apiClient, type APIResponse } from "./client";

// === School ===
export interface SchoolProfile {
  id: string;
  name: string;
  code: string;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  established_date: string | null;
  is_active: boolean;
}

// === Branch ===
export interface BranchProfile {
  id: string;
  name: string;
  school_id: string;
  school_name: string;
  location: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  principal_id: string | null;
  principal_name: string | null;
  capacity: number;
  established_date: string | null;
  is_active: boolean;
}

// === Classroom ===
export interface ClassroomProfile {
  id: string;
  name: string;
  grade_level: string;
  branch_id: string;
  branch_name: string;
  capacity: number;
  is_active: boolean;
}

// === Create/Update Responses ===
export interface CreateSchoolResponse {
  id: string;
}

export interface CreateBranchResponse {
  id: string;
}

export interface CreateClassroomResponse {
  id: string;
}

export const schoolRequests = {
  // === Schools ===
  listSchools: async (): Promise<APIResponse<SchoolProfile[]>> => {
    return apiClient.post<SchoolProfile[]>("/schools/list/");
  },

  createSchool: async (data: {
    name: string;
    code: string;
    address?: string;
    contact_email?: string;
    contact_phone?: string;
    established_date?: string;
  }): Promise<APIResponse<CreateSchoolResponse>> => {
    return apiClient.post<CreateSchoolResponse>("/schools/create/", data);
  },

  viewSchool: async (schoolId: string): Promise<APIResponse<SchoolProfile>> => {
    return apiClient.get<SchoolProfile>(`/schools/${schoolId}/view/`);
  },

  updateSchool: async (
    schoolId: string,
    data: Partial<{
      address: string;
      contact_email: string;
      contact_phone: string;
      established_date: string;
    }>
  ): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/schools/${schoolId}/update/`, data);
  },

  deleteSchool: async (schoolId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/schools/${schoolId}/delete/`);
  },

  // === Branches ===
  listBranches: async (): Promise<APIResponse<BranchProfile[]>> => {
    return apiClient.post<BranchProfile[]>("/schools/branches/list/");
  },

  createBranch: async (
    data: {
      name: string;
      location?: string;
      contact_email?: string;
      contact_phone?: string;
      principal_id?: string;
      capacity?: number;
      established_date?: string;
    }
  ): Promise<APIResponse<CreateBranchResponse>> => {
    return apiClient.post<CreateBranchResponse>("/schools/branches/create/", data);
  },

  viewBranch: async (branchId: string): Promise<APIResponse<BranchProfile>> => {
    return apiClient.get<BranchProfile>(`/schools/branches/${branchId}/view/`);
  },

  updateBranch: async (
    branchId: string,
    data: Partial<{
      location: string;
      contact_email: string;
      contact_phone: string;
      principal_id: string | null;
      capacity: number;
      established_date: string;
      is_active: boolean;
    }>
  ): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/schools/branches/${branchId}/update/`, data);
  },

  deleteBranch: async (branchId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/schools/branches/${branchId}/delete/`);
  },

  // === Classrooms ===
  listClassrooms: async (
    filters: Record<string, string> = {}
  ): Promise<APIResponse<ClassroomProfile[]>> => {
    return apiClient.post<ClassroomProfile[]>("/schools/classrooms/list/", filters);
  },

  createClassroom: async (
    data: {
      branch_id: string;
      name: string;
      grade_level: string;
      capacity?: number;
    }
  ): Promise<APIResponse<CreateClassroomResponse>> => {
    return apiClient.post<CreateClassroomResponse>("/schools/classrooms/create/", data);
  },

  viewClassroom: async (classroomId: string): Promise<APIResponse<ClassroomProfile>> => {
    return apiClient.get<ClassroomProfile>(`/schools/classrooms/${classroomId}/view/`);
  },

  updateClassroom: async (
    classroomId: string,
    data: Partial<{
      name: string;
      grade_level: string;
      capacity: number;
      is_active: boolean;
    }>
  ): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/schools/classrooms/${classroomId}/update/`, data);
  },

  deleteClassroom: async (classroomId: string): Promise<APIResponse<void>> => {
    return apiClient.post<void>(`/schools/classrooms/${classroomId}/delete/`);
  },
};