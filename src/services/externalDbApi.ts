// External PostgreSQL API service
// Uses Edge Function to connect to your external PostgreSQL database

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const EXTERNAL_DB_URL = `${SUPABASE_URL}/functions/v1/external-db`;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

const externalFetch = async (endpoint: string, options?: FetchOptions) => {
  const url = `${EXTERNAL_DB_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    ...options?.headers,
  };

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

// External Database API
export const externalDbApi = {
  // Courses
  courses: {
    getAll: () => externalFetch('/courses'),
    getOne: (id: string) => externalFetch(`/courses/${id}`),
    create: (data: CourseInput) => externalFetch('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: CourseInput) => externalFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => externalFetch(`/courses/${id}`, { method: 'DELETE' }),
  },

  // Lessons
  lessons: {
    getByCourse: (courseId: string) => externalFetch(`/courses/${courseId}/lessons`),
    create: (courseId: string, data: LessonInput) => externalFetch(`/courses/${courseId}/lessons`, { method: 'POST', body: JSON.stringify(data) }),
  },

  // Enrollments
  enrollments: {
    enroll: (courseId: string, userId: string) => externalFetch(`/courses/${courseId}/enroll`, { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
    getCourseEnrollments: (courseId: string) => externalFetch(`/courses/${courseId}/enrollments`),
  },

  // Services
  services: {
    getAll: () => externalFetch('/services'),
  },

  // Products
  products: {
    getAll: () => externalFetch('/products'),
  },

  // Specialists
  specialists: {
    getAll: () => externalFetch('/specialists'),
  },

  // Bookings
  bookings: {
    getAll: () => externalFetch('/bookings'),
  },

  // Orders
  orders: {
    getAll: () => externalFetch('/orders'),
  },

  // Users
  users: {
    getAll: () => externalFetch('/users'),
  },
};

// Types
export interface CourseInput {
  title: string;
  description?: string;
  price?: number;
  instructor_name?: string;
  duration_hours?: number;
  level?: string;
  image_url?: string;
  is_active?: boolean;
  is_new?: boolean;
  course_type?: string;
}

export interface LessonInput {
  title: string;
  description?: string;
  video_url?: string;
  duration_minutes?: number;
  order_index?: number;
  is_free?: boolean;
}

export default externalDbApi;
