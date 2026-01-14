
export enum UserRole {
  PLATFORM_OWNER = 'PLATFORM_OWNER',
  CHURCH_ADMIN = 'CHURCH_ADMIN',
  UNIT_HEAD = 'UNIT_HEAD',
  WORKER = 'WORKER'
}

export enum Currency {
  USD = '$',
  NGN = '₦',
  GBP = '£'
}

export enum FollowUpStatus {
  NEEDS_FOLLOW_UP = 'Needs Follow-up',
  CONTACTED = 'Contacted',
  SCHEDULED = 'Follow-up Scheduled',
  JOINED_UNIT = 'Joined a Unit',
  NOT_INTERESTED = 'Not Interested',
  NO_RESPONSE = 'No Response',
  CONVERTED = 'Converted to Member'
}

export enum TaskStatus {
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
  SUSPENDED = 'Suspended'
}

export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export interface Church {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  location: string; // Concatenated legacy field
  adminId: string;
  createdAt: string;
  currency?: Currency;
}

export interface User {
  id: string;
  churchId: string;
  fullName: string;
  email: string;
  role: UserRole;
  unitId?: string;
  status: 'PENDING' | 'APPROVED';
  dateOfBirth?: string;
  anniversaryDate?: string;
  hasAccountingAccess?: boolean;
}

export interface Unit {
  id: string;
  churchId: string;
  name: string;
  headIds: string[];
}

export interface FirstTimer {
  id: string;
  churchId: string;
  fullName: string;
  phone: string;
  email?: string;
  dateVisited: string;
  invitedBy?: string;
  assignedTo?: string; // Worker ID
  status: FollowUpStatus;
  notes: string;
  history: FollowUpLog[];
}

export interface FollowUpLog {
  id: string;
  date: string;
  action: string;
  performedBy: string;
}

export interface ActionPlan {
  id: string;
  churchId: string;
  unitId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  assignedTo: string; // User ID
  priority: Priority;
  status: TaskStatus;
}

export interface AttendanceRecord {
  id: string;
  churchId: string;
  date: string;
  total: number;
  male: number;
  female: number;
  children: number;
}

export interface Announcement {
  id: string;
  churchId: string;
  unitId?: string; // If null, it's global for church
  title: string;
  body: string;
  expiryDate?: string;
  createdAt: string;
}

export interface Property {
  id: string;
  churchId: string;
  unitId: string;
  name: string;
  quantity: number;
  status: 'Functional' | 'Maintenance' | 'Damaged';
}

export interface ChurchEvent {
  id: string;
  churchId: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

export interface Transaction {
  id: string;
  churchId: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  date: string;
  description: string;
  recordedBy: string;
}

export interface Budget {
  id: string;
  churchId: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  period: string; // e.g., "Monthly - May 2024"
}
