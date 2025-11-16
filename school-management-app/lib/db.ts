import fs from 'fs';
import path from 'path';
import type { User, Appointment, Announcement, CommunityPost, MapConfig } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize data files if they don't exist
const initFile = (filename: string, defaultData: any) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
};

// Initialize all data files
initFile('users.json', []);
initFile('appointments.json', []);
initFile('announcements.json', []);
initFile('community-posts.json', []);
initFile('map-configs.json', []);

// Generic read/write functions
export const readData = <T>(filename: string): T[] => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

export const writeData = <T>(filename: string, data: T[]): void => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
};

// User operations
export const getUsers = (): User[] => readData<User>('users.json');
export const saveUsers = (users: User[]): void => writeData('users.json', users);

export const getUserByUserId = (userId: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.userId === userId && u.isActive);
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(u => u.id === id && u.isActive);
};

export const createUser = (user: User): User => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
  return user;
};

// Appointment operations
export const getAppointments = (): Appointment[] => readData<Appointment>('appointments.json');
export const saveAppointments = (appointments: Appointment[]): void => writeData('appointments.json', appointments);

export const createAppointment = (appointment: Appointment): Appointment => {
  const appointments = getAppointments();
  appointments.push(appointment);
  saveAppointments(appointments);
  return appointment;
};

export const updateAppointment = (id: string, updates: Partial<Appointment>): Appointment | null => {
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  appointments[index] = { ...appointments[index], ...updates };
  saveAppointments(appointments);
  return appointments[index];
};

// Announcement operations
export const getAnnouncements = (): Announcement[] => readData<Announcement>('announcements.json');
export const saveAnnouncements = (announcements: Announcement[]): void => writeData('announcements.json', announcements);

export const createAnnouncement = (announcement: Announcement): Announcement => {
  const announcements = getAnnouncements();
  announcements.push(announcement);
  saveAnnouncements(announcements);
  return announcement;
};

// Community post operations
export const getCommunityPosts = (): CommunityPost[] => readData<CommunityPost>('community-posts.json');
export const saveCommunityPosts = (posts: CommunityPost[]): void => writeData('community-posts.json', posts);

export const createCommunityPost = (post: CommunityPost): CommunityPost => {
  const posts = getCommunityPosts();
  posts.push(post);
  saveCommunityPosts(posts);
  return post;
};

// Map config operations
export const getMapConfigs = (): MapConfig[] => readData<MapConfig>('map-configs.json');
export const saveMapConfigs = (configs: MapConfig[]): void => writeData('map-configs.json', configs);

export const getActiveMapConfig = (): MapConfig | undefined => {
  const configs = getMapConfigs();
  return configs.find(c => c.isActive);
};

export const createMapConfig = (config: MapConfig): MapConfig => {
  const configs = getMapConfigs();
  // Deactivate all other configs
  configs.forEach(c => c.isActive = false);
  configs.push(config);
  saveMapConfigs(configs);
  return config;
};
