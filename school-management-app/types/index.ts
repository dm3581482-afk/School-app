export type UserRole = 'admin' | 'teacher' | 'student' | 'public';
export type HouseGroup = 'red' | 'blue' | 'green' | 'yellow' | 'none';
export type AppointmentStatus = 'pending' | 'approved' | 'rejected';
export type AppointmentWith = 'principal' | 'vice_principal' | 'teacher';

export interface User {
  id: string;
  userId: string; // e.g., "john@kvs"
  password: string;
  name: string;
  role: UserRole;
  house: HouseGroup;
  createdAt: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  appointmentWith: AppointmentWith;
  teacherId?: string; // if appointmentWith is 'teacher'
  date: string;
  time: string;
  purpose: string;
  status: AppointmentStatus;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  house: HouseGroup | 'all'; // 'all' for school-wide
  isImportant: boolean;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  house: HouseGroup;
  createdAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface MapConfig {
  id: string;
  name: string;
  modelUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  isActive: boolean;
}

export interface AuthUser {
  id: string;
  userId: string;
  name: string;
  role: UserRole;
  house: HouseGroup;
}
