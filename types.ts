
export type UserRole = 'ADMIN' | 'GURU' | 'SISWA' | 'BENDAHARA';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  class?: string;
  avatar?: string;
  bio?: string;
  verified?: boolean;
  createdAt: any;
  lastLogin?: any;
}

export interface Flashcard {
  question: string;
  answer: string;
}

export interface JobListing {
  title: string;
  company: string;
  location: string;
  uri: string;
}

export interface CareerAnalysis {
  recommendation: string;
  jobMarketTrends: string[];
  skillsToImprove: string[];
  sources: any[];
}

export interface Syllabus {
  id: string;
  subjectId: string;
  teacherId: string;
  title: string;
  weeks: {
    week: number;
    topic: string;
    objective: string;
    activities: string[];
  }[];
  createdAt: any;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  coverUrl: string;
  fileUrl: string;
}

export interface Subject {
  id: string;
  name: string;
  teacherId: string;
}

export interface Material {
  id: string;
  title: string;
  fileUrl: string;
  type: 'PDF' | 'VIDEO' | 'TEXT';
  subjectId: string;
  createdAt: any;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  deadline: any;
  subjectId: string;
  createdAt: any;
  teacherId: string;
}

export interface Submission {
  id: string;
  studentId: string;
  studentName?: string;
  assignmentId: string;
  fileUrl: string;
  score: number | null;
  feedback?: string;
  status: 'PENDING' | 'GRADED';
  submittedAt: any;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  proofUrl: string;
  date: any;
  note?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  text: string;
  userId: string;
  userName: string;
  role: UserRole;
  createdAt: any;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  status: 'HADIR' | 'IZIN' | 'ALFA';
  date: any;
  teacherId: string;
}

export interface StudyNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: any;
}
