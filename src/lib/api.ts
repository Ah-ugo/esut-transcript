/** @format */

import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'https://esut-rs.onrender.com';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Don't intercept 401s for login or refresh requests
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/login') &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;
      const refresh = Cookies.get('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refresh,
          });
          const { access_token } = res.data;
          Cookies.set('access_token', access_token, { expires: 1 });
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/auth/login';
        }
      } else {
        Cookies.remove('access_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  refresh: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),
  changePassword: (data: any) => api.post('/auth/change-password', data),
};

// ── Admin ─────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getPendingResults: (page = 1, perPage = 20) =>
    api.get(`/admin/pending-results?page=${page}&per_page=${perPage}`),
  setGradingConfig: (data: any) => api.post('/admin/grading-config', data),
  getGradingConfig: (programmeId?: string) =>
    api.get(
      `/admin/grading-config${programmeId ? `?programme_id=${programmeId}` : ''}`,
    ),
};

// ── Programmes ────────────────────────────────────────────
export const programmesApi = {
  list: (page = 1, perPage = 20) =>
    api.get(`/programmes/?page=${page}&per_page=${perPage}`),
  get: (id: string) => api.get(`/programmes/${id}`),
  create: (data: any) => api.post('/programmes', data),
  update: (id: string, data: any) => api.put(`/programmes/${id}`, data),
  delete: (id: string) => api.delete(`/programmes/${id}`),
};

// ── Courses ───────────────────────────────────────────────
export const coursesApi = {
  list: (params?: any) => api.get('/courses', { params }),
  get: (id: string) => api.get(`/courses/${id}`),
  create: (data: {
    code: string;
    title: string;
    units: number;
    semester: 'first' | 'second';
    level: number;
    programme_code: string;
  }) => api.post('/courses/', data),
  update: (id: string, data: any) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  assignLecturer: (courseId: string, data: any) =>
    api.post(`/courses/${courseId}/assign-lecturer`, data),
  getLecturerCourses: (lecturerId: string, session: string) =>
    api.get(`/courses/lecturer/${lecturerId}`, { params: { session } }),
};

// ── Students ──────────────────────────────────────────────
export const studentsApi = {
  list: (params?: any) => api.get('/students/', { params }),
  get: (id: string) => api.get(`/students/${id}`),
  getByMatric: (matric: string) => api.get(`/students/by-matric/${matric}`),
  create: (data: any) => api.post('/students/', data),
  update: (id: string, data: any) => api.put(`/students/${id}`, data),
  delete: (id: string) => api.delete(`/students/${id}`),
  importCsv: (formData: FormData) =>
    api.post('/students/import-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Results ───────────────────────────────────────────────
export const resultsApi = {
  add: (data: {
    // Updated signature for add method
    matric_number: string; // Changed from student_id
    course_code: string; // Changed from course_id
    score: number;
    session: string;
    semester: string;
  }) => api.post('/results/', data),
  bulkUpload: (data: {
    course_code: string;
    session: string;
    semester: string;
    results: { matric_number: string; score: number }[];
  }) => api.post('/results/bulk', data),
  uploadCsv: (formData: FormData) =>
    api.post('/results/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStudentResults: (studentId: string, params?: any) =>
    api.get(`/results/student/${studentId}`, { params }),
  getCourseResults: (courseId: string, session: string, semester: string) =>
    api.get(
      `/results/course/${courseId}?session=${session}&semester=${semester}`,
    ),
  getStudentSummary: (studentId: string) =>
    api.get(`/results/student/${studentId}/summary`),
  approve: (resultId: string) => api.patch(`/results/${resultId}/approve`),
  reject: (resultId: string, reason: string) =>
    api.patch(
      `/results/${resultId}/reject?reason=${encodeURIComponent(reason)}`,
    ),
  bulkApprove: (resultIds: string[]) =>
    api.post('/results/approve-bulk', { result_ids: resultIds }),

  getLecturerSubmissions: (lecturerId: string) =>
    api.get(`/results/lecturer/${lecturerId}`),
};

// ── Transcripts ───────────────────────────────────────────
export const transcriptsApi = {
  getData: (studentId: string) => api.get(`/transcripts/student/${studentId}`),
  downloadPdf: (studentId: string) =>
    api.get(`/transcripts/student/${studentId}/pdf`, { responseType: 'blob' }),
  verify: (matricNumber: string) =>
    api.get(`/transcripts/verify/${matricNumber}`),
};

// ── Users ─────────────────────────────────────────────────
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  resetPassword: (id: string, newPassword: string) =>
    api.post(`/users/reset-password/${id}`, { new_password: newPassword }),
};

// ── Audit ─────────────────────────────────────────────────
export const auditApi = {
  list: (params?: any) => api.get('/audit', { params }),
};
