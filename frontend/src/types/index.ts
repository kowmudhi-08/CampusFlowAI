export type Role = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  profileId?: number;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
  profileId?: number;
}

export interface UserProfileResponse {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  profileId?: number;
  code?: string;
  departmentId?: number;
  departmentName?: string;
  phone?: string;
  address?: string;
  designation?: string;
  qualification?: string;
  batchYear?: number;
  cgpa?: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface AcademicSession {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Student {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  rollNumber: string;
  departmentId?: number;
  departmentName?: string;
  batchYear?: number;
  phone?: string;
  address?: string;
  cgpa: number;
  active: boolean;
  createdAt?: string;
}

export interface Faculty {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  employeeCode: string;
  departmentId?: number;
  departmentName?: string;
  designation?: string;
  phone?: string;
  qualification?: string;
  active: boolean;
  createdAt?: string;
}

export interface Course {
  id: number;
  code: string;
  title: string;
  description?: string;
  credits: number;
  departmentId?: number;
  departmentName?: string;
  facultyId?: number;
  facultyName?: string;
  academicSessionId?: number;
  academicSessionName?: string;
  semester: number;
  enrolledStudentsCount: number;
}

export interface Enrollment {
  id: number;
  studentId: number;
  studentName: string;
  studentRollNumber: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  courseCredits: number;
  facultyName?: string;
  academicSessionId?: number;
  academicSessionName?: string;
  enrolledAt: string;
  status: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  studentRollNumber: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  facultyId?: number;
  facultyName?: string;
  attendanceDate: string;
  sessionName: string;
  status: AttendanceStatus;
  remarks?: string;
  recordedAt: string;
}

export interface AttendanceSummary {
  studentId: number;
  studentName: string;
  rollNumber: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  totalSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  percentage: number;
  lowAttendanceWarning: boolean;
}

export type ExamType = 'QUIZ' | 'MIDTERM' | 'FINAL' | 'PRACTICAL';

export interface Examination {
  id: number;
  title: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  examDate: string;
  startTime?: string;
  durationMinutes?: number;
  maxMarks: number;
  examType: ExamType;
  published: boolean;
}

export interface Mark {
  id: number;
  examinationId: number;
  examTitle: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  studentId: number;
  studentName: string;
  studentRollNumber: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  remarks?: string;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  facultyId?: number;
  facultyName?: string;
  dueDate: string;
  maxMarks: number;
  createdAt: string;
  submissionsCount: number;
}

export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'LATE';

export interface Submission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  studentId: number;
  studentName: string;
  studentRollNumber: string;
  submissionText?: string;
  fileUrl?: string;
  submittedAt: string;
  marksObtained?: number;
  maxMarks?: number;
  feedback?: string;
  status: SubmissionStatus;
}

export type NoticeAudience = 'ALL' | 'STUDENTS' | 'FACULTY';

export interface Notice {
  id: number;
  title: string;
  content: string;
  audience: NoticeAudience;
  active: boolean;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

export interface PlacementDrive {
  id: number;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  eligibilityCriteria?: string;
  minCgpa: number;
  packageDetails?: string;
  deadline: string;
  active: boolean;
  totalApplications: number;
  createdAt: string;
}

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED';

export interface PlacementApplication {
  id: number;
  placementDriveId: number;
  companyName: string;
  jobTitle: string;
  packageDetails?: string;
  studentId: number;
  studentName: string;
  studentRollNumber: string;
  studentDepartment?: string;
  studentCgpa: number;
  resumeUrl?: string;
  appliedAt: string;
  status: ApplicationStatus;
  remarks?: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalCourses: number;
  totalEnrollments: number;
  totalAttendanceRecords: number;
  totalExaminations: number;
  totalAssignments: number;
  activeNotices: number;
  activePlacementDrives: number;
  totalApplications: number;
  overallAttendanceRate?: number;
  departmentStudentCounts?: Record<string, number>;
}

export interface PerformanceInsights {
  studentId: number;
  studentName: string;
  rollNumber: string;
  attendancePercentage: number;
  averageExamMarks: number;
  totalAssignmentsSubmitted: number;
  riskStatus: 'LOW_RISK' | 'MODERATE_RISK' | 'AT_RISK' | 'INSUFFICIENT_DATA';
  dataSufficient: boolean;
  statusMessage: string;
  predictedScoreRange?: string;
  confidenceScore?: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  sufficientData?: boolean;
  message?: string;
  predictedScore?: number;
  confidence?: number;
  riskLevel?: string;
  currentAttendancePercentage?: number;
}

export interface PlacementReadiness {
  studentId: number;
  studentName: string;
  rollNumber: string;
  currentCgpa: number;
  attendancePercentage: number;
  readinessScore: number;
  readinessLevel: 'NOT_READY' | 'NEEDS_IMPROVEMENT' | 'READY' | 'HIGHLY_COMPETITIVE';
  eligible: boolean;
  eligibleDrivesCount: number;
  explanation: string;
  positiveFactors: string[];
  gapFactors: string[];
  recommendedActions: string[];
  sufficientData?: boolean;
  message?: string;
  readinessTier?: string;
  suggestedRole?: string;
  keyRecommendations?: string[];
}

