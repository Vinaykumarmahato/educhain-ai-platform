
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  fullName: string;
  email: string;
  avatar?: string;
  department?: string; // Home branch for Faculty
  token?: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'REGISTRATION' | 'SYSTEM' | 'ACADEMIC';
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  password?: string;
  enrollmentDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  gpa: number;
  major: string;
  semester: number;
  successScore?: number; // 0-100
  riskLevel?: RiskLevel;
}

export interface Faculty {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  password?: string;
  department: string;
  designation: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'INACTIVE';
  joiningDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  branch: string;
  semester: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  instructor: string;
  studentCount: number;
  capacity: number;
  semester: number;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  grade: string;
  score: number;
  semester: string;
  department?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  activeTeachers: number;
  averageGpa: number;
  recentEnrollments: number[];
  branchDistribution: { name: string; val: number }[];
  // Role specific
  studentStats?: {
    personalGpa: number;
    attendanceRate: number;
    creditsEarned: number;
    upcomingDeadlines: { title: string; date: string }[];
  };
  teacherStats?: {
    assignedCourses: number;
    avgClassPerformance: number;
    pendingAttendance: number;
  };
}
