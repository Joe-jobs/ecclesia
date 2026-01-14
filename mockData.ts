
import { UserRole, FollowUpStatus, TaskStatus, Priority } from './types';

export const MOCK_CHURCHES = [
  { id: 'c1', name: 'Grace Fellowship Center', location: 'Lagos, Nigeria', adminId: 'u2', createdAt: '2023-01-10' },
  { id: 'c2', name: 'Victory Chapel Int\'l', location: 'Houston, TX', adminId: 'u5', createdAt: '2023-05-20' }
];

export const MOCK_USERS = [
  { id: 'u1', churchId: 'all', fullName: 'Super Admin', email: 'platform@ecclesia.com', role: UserRole.PLATFORM_OWNER, status: 'APPROVED' },
  { id: 'u2', churchId: 'c1', fullName: 'Admin John Doe', email: 'pastor@grace.com', role: UserRole.CHURCH_ADMIN, status: 'APPROVED', dateOfBirth: '1980-05-15' },
  { id: 'u3', churchId: 'c1', fullName: 'Sarah Smith', email: 'sarah@grace.com', role: UserRole.UNIT_HEAD, unitId: 'un1', status: 'APPROVED' },
  { id: 'u4', churchId: 'c1', fullName: 'David King', email: 'david@grace.com', role: UserRole.WORKER, unitId: 'un1', status: 'APPROVED', dateOfBirth: '1995-12-01' },
  { id: 'u5', churchId: 'c1', fullName: 'New Worker', email: 'new@grace.com', role: UserRole.WORKER, unitId: 'un2', status: 'PENDING' },
];

export const MOCK_UNITS = [
  { id: 'un1', churchId: 'c1', name: 'Media & IT', headIds: ['u3'] },
  { id: 'un2', churchId: 'c1', name: 'Hospitality', headIds: [] },
  { id: 'un3', churchId: 'c1', name: 'Choir', headIds: [] },
];

export const MOCK_FIRST_TIMERS = [
  { 
    id: 'ft1', churchId: 'c1', fullName: 'Alice Johnson', phone: '+2348012345678', email: 'alice@test.com', 
    dateVisited: '2024-05-10', invitedBy: 'Member X', assignedTo: 'u4', status: FollowUpStatus.NEEDS_FOLLOW_UP, 
    notes: 'Very interested in joining the choir.', history: [] 
  },
  { 
    id: 'ft2', churchId: 'c1', fullName: 'Robert Brown', phone: '+2348088889999', 
    dateVisited: '2024-05-11', invitedBy: 'Self', assignedTo: 'u4', status: FollowUpStatus.CONTACTED, 
    notes: 'Sent a welcome SMS.', history: [{ id: 'h1', date: '2024-05-12', action: 'Called and welcomed', performedBy: 'u4' }] 
  }
];

export const MOCK_ATTENDANCE = [
  { id: 'a1', churchId: 'c1', date: '2024-04-07', total: 450, male: 200, female: 150, children: 100 },
  { id: 'a2', churchId: 'c1', date: '2024-04-14', total: 480, male: 210, female: 160, children: 110 },
  { id: 'a3', churchId: 'c1', date: '2024-04-21', total: 420, male: 190, female: 140, children: 90 },
  { id: 'a4', churchId: 'c1', date: '2024-04-28', total: 510, male: 230, female: 170, children: 110 },
  { id: 'a5', churchId: 'c1', date: '2024-05-05', total: 550, male: 250, female: 180, children: 120 },
];

export const MOCK_TASKS = [
  { id: 't1', churchId: 'c1', unitId: 'un1', title: 'Stream Sunday Service', description: 'Ensure the YouTube stream is active by 8:45 AM', startDate: '2024-05-19', endDate: '2024-05-19', assignedTo: 'u4', priority: Priority.HIGH, status: TaskStatus.IN_PROGRESS },
  { id: 't2', churchId: 'c1', unitId: 'un1', title: 'Edit Testimonial Video', description: 'Edit the 3-minute video for church website', startDate: '2024-05-15', endDate: '2024-05-25', assignedTo: 'u4', priority: Priority.MEDIUM, status: TaskStatus.DONE },
];

export const MOCK_ANNOUNCEMENTS = [
  { id: 'an1', churchId: 'c1', title: 'Workers Meeting', body: 'All workers must be present by 7:30 AM this Sunday.', createdAt: '2024-05-15' },
  { id: 'an2', churchId: 'c1', unitId: 'un1', title: 'New Camera Gear', body: 'We have received new 4K cameras. Training session on Saturday.', createdAt: '2024-05-16' },
];

export const MOCK_PROPERTIES = [
  { id: 'p1', churchId: 'c1', unitId: 'un1', name: 'Canon R5 Camera', quantity: 2, status: 'Functional' },
  { id: 'p2', churchId: 'c1', unitId: 'un1', name: 'Video Switcher', quantity: 1, status: 'Functional' },
];

export const MOCK_EVENTS = [
  { id: 'e1', churchId: 'c1', title: 'Worship Night', description: 'An evening of deep worship and encounter.', date: '2024-05-30', location: 'Main Auditorium' },
];
