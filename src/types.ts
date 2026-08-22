export type UserRole = "treasurer" | "student";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  role: UserRole;
  createdAt: string;
  
  // Student specific fields
  studentId?: string;
  program?: string;
  yearLevel?: string;
  section?: string;
  contact?: string;
}

export interface Classroom {
  id: string;
  name: string;
  school: string;
  program: string;
  yearLevel: string;
  section: string;
  schoolYear: string;
  contributionGoal: number;
  description?: string;
  treasurerId: string;
  createdAt: string;
  inviteCode: string;
  inviteExpiresAt?: string;
  inviteStatus: "active" | "inactive";
}

export interface Member {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  status: "active" | "inactive";
  studentId?: string;
}

export interface Payment {
  id: string;
  classroomId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: "Cash" | "GCash" | "Bank Transfer" | "Other";
  referenceNumber?: string;
  paymentDate: string;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  classroomId: string;
  description: string;
  amount: number;
  category: string;
  receiptURL?: string;
  recordedBy: string;
  paidTo: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  classroomId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
