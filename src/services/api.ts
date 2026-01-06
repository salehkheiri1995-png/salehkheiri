const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

const apiFetch = async (endpoint: string, options?: FetchOptions) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

export const api = {
  // Courses
  courses: {
    getAll: () => apiFetch('/courses'),
    getOne: (id: string) => apiFetch(`/courses/${id}`),
    create: (data: any) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch(`/courses/${id}`, { method: 'DELETE' }),
  },

  // Lessons
  lessons: {
    getByCourse: (courseId: string) => apiFetch(`/courses/${courseId}/lessons`),
    create: (courseId: string, data: any) => apiFetch(`/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
    update: (courseId: string, lessonId: string, data: any) => apiFetch(`/courses/${courseId}/lessons/${lessonId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (courseId: string, lessonId: string) => apiFetch(`/courses/${courseId}/lessons/${lessonId}`, { method: 'DELETE' }),
  },

  // Enrollments
  enrollments: {
    enroll: (courseId: string, data: any) => apiFetch(`/courses/${courseId}/enroll`, { method: 'POST', body: JSON.stringify(data) }),
    getStudentEnrollments: (userId: string) => apiFetch(`/courses/student/${userId}/enrollments`),
    getCourseEnrollments: (courseId: string) => apiFetch(`/courses/${courseId}/enrollments`),
  },
};

export default api;
