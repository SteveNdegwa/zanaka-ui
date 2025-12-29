import { apiClient, type APIResponse } from "./client";

export interface BranchProfile {
  id: string;
  name: string;
  school_id: string;
  school_name: string;
  loaction: string;
  contact_email: string;
  contact_phone: string;
  principal_id: string | null;
  principal_name: string | null;
  capacity: number;
  established_date: string;
  is_active: boolean;
}

export interface ClassroomProfile {
  id: string;
  name: string;
  grade_level: string;
  branch_id: string;
  branch_name: string;
  capacity: number;
  is_active: boolean;
}

export const schoolRequests = {
  listBranches: async (): Promise<APIResponse<BranchProfile[]>> => {
    return apiClient.post<BranchProfile[]>("/schools/branches/list/");
  },
  listClassrooms: async (filters: Record<string, string> = {}): Promise<APIResponse<ClassroomProfile[]>> => {
    return apiClient.post<ClassroomProfile[]>(`/schools/classrooms/list/`, filters);
  }
};