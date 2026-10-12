import { apiClient } from './client';
import {
  AuthResponse,
  UserProfileResponse,
  Department,
  AcademicSession,
  Student,
  Faculty,
  Course,
  Enrollment,
  AttendanceRecord,
  AttendanceSummary,
  Examination,
  Mark,
  Assignment,
  Submission,
  Notice,
  PlacementDrive,
  PlacementApplication,
  DashboardMetrics,
  PerformanceInsights,
  PlacementReadiness,
} from '../types';

export const authApi = {
  getAdminSetupStatus: () => apiClient.get<{ setupRequired: boolean; message: string }>('/auth/admin-setup-status'),
  setupAdmin: (data: any) => apiClient.post<AuthResponse>('/auth/setup-admin', data),
  register: (data: any) => apiClient.post<AuthResponse>('/auth/register', data),
  login: (data: any) => apiClient.post<AuthResponse>('/auth/login', data),
  getMe: () => apiClient.get<UserProfileResponse>('/auth/me'),
  updateProfile: (data: any) => apiClient.put<UserProfileResponse>('/auth/me', data),
  changePassword: (data: any) => apiClient.post('/auth/change-password', data),
  logout: () => apiClient.post('/auth/logout'),
};

export const departmentApi = {
  getAll: () => apiClient.get<Department[]>('/departments'),
  getById: (id: number) => apiClient.get<Department>(`/departments/${id}`),
  create: (data: Partial<Department>) => apiClient.post<Department>('/departments', data),
  update: (id: number, data: Partial<Department>) => apiClient.put<Department>(`/departments/${id}`, data),
  delete: (id: number) => apiClient.delete(`/departments/${id}`),
};

export const academicSessionApi = {
  getAll: () => apiClient.get<AcademicSession[]>('/academic-sessions'),
  create: (data: Partial<AcademicSession>) => apiClient.post<AcademicSession>('/academic-sessions', data),
  update: (id: number, data: Partial<AcademicSession>) => apiClient.put<AcademicSession>(`/academic-sessions/${id}`, data),
  delete: (id: number) => apiClient.delete(`/academic-sessions/${id}`),
};

export const studentApi = {
  getAll: (deptId?: number, search?: string) =>
    apiClient.get<Student[]>('/students', { params: { departmentId: deptId, search } }),
  getById: (id: number) => apiClient.get<Student>(`/students/${id}`),
  create: (data: any) => apiClient.post<Student>('/students', data),
  update: (id: number, data: any) => apiClient.put<Student>(`/students/${id}`, data),
  delete: (id: number) => apiClient.delete(`/students/${id}`),
  // Student self-service
  getMyCourses: () => apiClient.get<Enrollment[]>('/students/me/courses'),
  getMyAttendance: () => apiClient.get<AttendanceSummary[]>('/students/me/attendance'),
  getMyAttendanceHistory: () => apiClient.get<AttendanceRecord[]>('/students/me/attendance/history'),
  getMyMarks: () => apiClient.get<Mark[]>('/students/me/marks'),
  getMySubmissions: () => apiClient.get<Submission[]>('/students/me/submissions'),
  getMyApplications: () => apiClient.get<PlacementApplication[]>('/students/me/applications'),
  getMyPerformanceInsights: () => apiClient.get<PerformanceInsights>('/students/me/performance-insights'),
  getMyPlacementReadiness: () => apiClient.get<PlacementReadiness>('/students/me/placement-readiness'),
};

export const facultyApi = {
  getAll: (deptId?: number, search?: string) =>
    apiClient.get<Faculty[]>('/faculty', { params: { departmentId: deptId, search } }),
  getById: (id: number) => apiClient.get<Faculty>(`/faculty/${id}`),
  create: (data: any) => apiClient.post<Faculty>('/faculty', data),
  update: (id: number, data: any) => apiClient.put<Faculty>(`/faculty/${id}`, data),
  delete: (id: number) => apiClient.delete(`/faculty/${id}`),
  getMyCourses: () => apiClient.get<Course[]>('/faculty/me/courses'),
};

export const courseApi = {
  getAll: (deptId?: number, facultyId?: number) =>
    apiClient.get<Course[]>('/courses', { params: { departmentId: deptId, facultyId } }),
  getById: (id: number) => apiClient.get<Course>(`/courses/${id}`),
  create: (data: any) => apiClient.post<Course>('/courses', data),
  update: (id: number, data: any) => apiClient.put<Course>(`/courses/${id}`, data),
  delete: (id: number) => apiClient.delete(`/courses/${id}`),
};

export const enrollmentApi = {
  getAll: () => apiClient.get<Enrollment[]>('/enrollments'),
  getByCourse: (courseId: number) => apiClient.get<Enrollment[]>(`/enrollments/course/${courseId}`),
  enroll: (data: { studentId: number; courseId: number; academicSessionId?: number }) =>
    apiClient.post<Enrollment>('/enrollments', data),
  unenroll: (id: number) => apiClient.delete(`/enrollments/${id}`),
};

export const attendanceApi = {
  mark: (data: any) => apiClient.post<AttendanceRecord[]>('/attendance/mark', data),
  update: (id: number, data: any) => apiClient.put<AttendanceRecord>(`/attendance/${id}`, data),
  getByCourse: (courseId: number) => apiClient.get<AttendanceRecord[]>(`/attendance/course/${courseId}`),
  getByStudent: (studentId: number) => apiClient.get<AttendanceRecord[]>(`/attendance/student/${studentId}`),
  getStudentSummary: (studentId: number) => apiClient.get<AttendanceSummary[]>(`/attendance/student/${studentId}/summary`),
};

export const examinationApi = {
  getAll: () => apiClient.get<Examination[]>('/examinations'),
  getPublished: () => apiClient.get<Examination[]>('/examinations/published'),
  getByCourse: (courseId: number) => apiClient.get<Examination[]>(`/examinations/course/${courseId}`),
  create: (data: any) => apiClient.post<Examination>('/examinations', data),
  update: (id: number, data: any) => apiClient.put<Examination>(`/examinations/${id}`, data),
  publish: (id: number, published: boolean) =>
    apiClient.put<Examination>(`/examinations/${id}/publish`, null, { params: { published } }),
  delete: (id: number) => apiClient.delete(`/examinations/${id}`),
  enterMarks: (data: any) => apiClient.post<Mark[]>('/examinations/marks', data),
  getMarks: (examId: number) => apiClient.get<Mark[]>(`/examinations/${examId}/marks`),
};

export const assignmentApi = {
  getAll: () => apiClient.get<Assignment[]>('/assignments'),
  getByCourse: (courseId: number) => apiClient.get<Assignment[]>(`/assignments/course/${courseId}`),
  create: (data: any) => apiClient.post<Assignment>('/assignments', data),
  delete: (id: number) => apiClient.delete(`/assignments/${id}`),
  submit: (data: any) => apiClient.post<Submission>('/assignments/submit', data),
  getSubmissions: (assignmentId: number) => apiClient.get<Submission[]>(`/assignments/${assignmentId}/submissions`),
  gradeSubmission: (submissionId: number, data: any) =>
    apiClient.put<Submission>(`/assignments/submissions/${submissionId}/grade`, data),
};

export const noticeApi = {
  getAll: () => apiClient.get<Notice[]>('/notices'),
  getFeed: () => apiClient.get<Notice[]>('/notices/feed'),
  create: (data: any) => apiClient.post<Notice>('/notices', data),
  update: (id: number, data: any) => apiClient.put<Notice>(`/notices/${id}`, data),
  delete: (id: number) => apiClient.delete(`/notices/${id}`),
};

export const placementApi = {
  getAllDrives: () => apiClient.get<PlacementDrive[]>('/placements/drives'),
  getActiveDrives: () => apiClient.get<PlacementDrive[]>('/placements/drives/active'),
  getDriveById: (id: number) => apiClient.get<PlacementDrive>(`/placements/drives/${id}`),
  createDrive: (data: any) => apiClient.post<PlacementDrive>('/placements/drives', data),
  updateDrive: (id: number, data: any) => apiClient.put<PlacementDrive>(`/placements/drives/${id}`, data),
  deleteDrive: (id: number) => apiClient.delete(`/placements/drives/${id}`),
  apply: (data: any) => apiClient.post<PlacementApplication>('/placements/apply', data),
  getDriveApplications: (driveId: number) => apiClient.get<PlacementApplication[]>(`/placements/drives/${driveId}/applications`),
  updateApplicationStatus: (appId: number, data: any) =>
    apiClient.put<PlacementApplication>(`/placements/applications/${appId}/status`, data),
};

export const analyticsApi = {
  getMetrics: () => apiClient.get<DashboardMetrics>('/analytics/metrics'),
  getStudentInsights: (studentId: number) => apiClient.get<PerformanceInsights>(`/analytics/student/${studentId}/insights`),
  getStudentReadiness: (studentId: number) => apiClient.get<PlacementReadiness>(`/analytics/student/${studentId}/readiness`),
};

export const aiApi = {
  getHealth: () => apiClient.get<any>('/ai/health'),
  getStudentPerformance: (studentId: number) => apiClient.get<PerformanceInsights>(`/ai/student/${studentId}/performance`),
  getStudentReadiness: (studentId: number) => apiClient.get<PlacementReadiness>(`/ai/student/${studentId}/readiness`),
};
