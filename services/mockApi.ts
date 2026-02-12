import api from './api';
import { Student, Course, User, UserRole, DashboardStats, GradeRecord, AttendanceRecord, Faculty, Notification } from '../types';

export const BRANCHES = ['B.Tech', 'BCA', 'M.Tech', 'MBA', 'Arts'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
export const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Visiting Faculty'];

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export const mockApi = {
  login: async (username: string, pass: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await api.post('/auth/login', { username, password: pass });
      const { token, fullName, roles, avatar, email } = response.data;

      const role = roles.includes('ROLE_ADMIN') ? UserRole.ADMIN :
        roles.includes('ROLE_TEACHER') ? UserRole.TEACHER : UserRole.STUDENT;

      return {
        token,
        user: {
          id: username,
          username,
          fullName,
          role,
          email,
          avatar,
          token
        }
      };
    } catch (error) {
      throw new Error('Identity not found in institutional registry.');
    }
  },

  updateProfile: async (data: { fullName?: string, email?: string, avatar?: string }): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    const { username, fullName, roles, avatar, email } = response.data;

    // Map role string to Enum
    const role = roles.includes('ROLE_ADMIN') ? UserRole.ADMIN :
      roles.includes('ROLE_TEACHER') ? UserRole.TEACHER : UserRole.STUDENT;

    return {
      id: username,
      username,
      fullName,
      role,
      email,
      avatar
    };
  },

  register: async (data: any): Promise<{ message: string; generatedId: string; fullName: string; role: string; mobile: string }> => {
    await delay(1000);
    return { message: 'Registration request submitted for verification.', generatedId: 'PENDING', fullName: `${data.firstName} ${data.lastName}`, role: data.role, mobile: data.mobileNumber };
  },

  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return [];
    }
  },

  markNotificationRead: async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
  },

  getDashboardStats: async (user: User): Promise<DashboardStats> => {
    try {
      const response = await api.get('/dashboard/stats');
      const data = response.data;
      return {
        ...data,
        branchDistribution: data.branchDistribution || []
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      // Fallback to empty stats to avoid infinite loading
      return {
        totalStudents: 0, totalCourses: 0, activeTeachers: 0, averageGpa: 0,
        recentEnrollments: [], branchDistribution: []
      };
    }
  },

  getStudents: async (user: User, page: number, size: number, search: string, branch: string, semester: string, status: string) => {
    try {
      const response = await api.get('/students', {
        params: { search, page, size }
      });
      return {
        content: (response.data.content || []).map((s: any) => ({
          ...s,
          major: typeof s.major === 'object' ? s.major?.name : s.major || 'Unassigned'
        })),
        total: response.data.totalElements || 0
      };
    } catch (error) {
      console.error('Failed to fetch students', error);
      return { content: [], total: 0 };
    }
  },

  getFaculty: async (search: string, branch: string, status: string) => {
    try {
      const response = await api.get('/faculty', { params: { search } });
      return (response.data || []).map((f: any) => ({
        ...f,
        department: typeof f.department === 'object' ? f.department?.name : f.department || 'Unassigned'
      }));
    } catch (error) {
      return [];
    }
  },

  createFaculty: async (f: any) => {
    const response = await api.post('/faculty', f);
    return response.data;
  },

  updateFaculty: async (id: string, f: any) => {
    // PUT endpoint not specifically implemented, assuming basic POST/save works for now
    await api.post('/faculty', { ...f, id });
    return f;
  },

  deleteFaculty: async (id: string) => {
    await api.delete(`/faculty/${id}`);
  },

  createStudent: async (s: any) => {
    const response = await api.post('/students', s);
    return response.data;
  },

  updateStudent: async (id: string, s: any) => {
    await api.post('/students', { ...s, id });
    return s;
  },

  deleteStudent: async (id: string) => {
    await api.delete(`/students/${id}`);
  },

  getCourses: async (user: User, page: number, size: number, search: string, branch: string, semester: string) => {
    try {
      const response = await api.get('/courses', { params: { search, page, size } });
      return {
        content: (response.data.content || []).map((c: any) => ({
          ...c,
          department: typeof c.department === 'object' ? c.department?.name : c.department || 'Unassigned'
        })),
        total: response.data.totalElements || 0
      };
    } catch (error) {
      return { content: [], total: 0 };
    }
  },

  updateCourse: async (id: string, c: any) => {
    await api.post('/courses', { ...c, id });
    return c;
  },

  createCourse: async (c: any) => {
    const response = await api.post('/courses', c);
    return response.data;
  },

  deleteCourse: async (id: string) => {
    await api.delete(`/courses/${id}`);
  },

  getAttendance: async (user: User, date: string, branch: string, semester: string, search: string = ''): Promise<AttendanceRecord[]> => {
    try {
      const response = await api.get('/attendance', { params: { date, branch, semester } });
      const records = response.data.map((a: any) => ({
        id: a.id ? a.id.toString() : `temp-${a.student?.studentId}`,
        studentId: a.student?.studentId,
        studentName: `${a.student?.firstName} ${a.student?.lastName}`,
        date: a.date,
        status: a.status || 'ABSENT', // Default to absent if null
        branch: a.branch,
        semester: a.semester
      }));

      // Client-side search filtering
      if (search) {
        const lowerSearch = search.toLowerCase();
        return records.filter((r: AttendanceRecord) =>
          r.studentName.toLowerCase().includes(lowerSearch) ||
          r.studentId.toLowerCase().includes(lowerSearch)
        );
      }

      return records;
    } catch (error) {
      console.error('Failed to fetch attendance', error);
      return [];
    }
  },

  updateAttendance: async (date: string, studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', branch: string, semester: number) => {
    try {
      await api.post('/attendance', { date, studentId, status, branch, semester });
      return true;
    } catch (error) {
      console.error('Failed to update attendance', error);
      throw error;
    }
  },

  sendAbsenteeNotifications: async (absentees: AttendanceRecord[]) => {
    await delay(500);
    return true;
  },

  getGrades: async (user: User) => {
    try {
      let url = '/grades';
      if (user.role === UserRole.STUDENT) {
        url = `/grades/student/${user.username}`;
      }

      const response = await api.get(url);
      return (response.data || []).map((g: any) => ({
        id: g.id?.toString() || 'temp',
        studentId: g.student?.studentId || 'N/A',
        studentName: g.student ? `${g.student.firstName} ${g.student.lastName}` : 'Unknown',
        courseName: g.course?.name || 'Unknown Course',
        grade: g.grade,
        score: g.marks !== undefined ? g.marks : g.score,
        semester: g.semester ? `Semester ${g.semester}` : 'Spring 2024',
        department: g.student?.major?.name || 'Unassigned'
      }));
    } catch (error) {
      console.error('Failed to fetch grades', error);
      return [];
    }
  },

  createGrade: async (g: any) => {
    const response = await api.post('/grades', {
      studentId: g.studentId,
      courseCode: g.courseCode,
      score: g.score,
      grade: g.grade,
      semester: 1
    });
    return response.data;
  },

  updateGrade: async (id: string, g: any) => {
    await api.post('/grades', { ...g, id, semester: 1 });
    return g;
  },

  deleteGrade: async (id: string) => {
    await api.delete(`/grades/${id}`);
  },

  getAtRiskStudents: async (user: User): Promise<Student[]> => {
    try {
      const response = await api.get('/students/at-risk');
      return (response.data || []).map((s: any) => ({
        ...s,
        major: typeof s.major === 'object' ? s.major?.name : s.major || 'Unassigned'
      }));
    } catch (err) {
      return [];
    }
  },

  globalSearch: async (query: string): Promise<{ students: Student[], courses: Course[], faculty: Faculty[] }> => {
    // Placeholder for global search
    return { students: [], courses: [], faculty: [] };
  }
};
