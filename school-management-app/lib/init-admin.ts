import { getUsers, createUser } from './db';
import { hashPassword } from './auth';
import type { User } from '@/types';

export async function initializeAdmin() {
  const users = getUsers();
  
  // Check if admin already exists
  const adminExists = users.some(u => u.role === 'admin');
  
  if (!adminExists) {
    // Create default admin account
    const hashedPassword = await hashPassword('admin123');
    
    const adminUser: User = {
      id: 'admin-001',
      userId: 'admin@kvs',
      password: hashedPassword,
      name: 'Principal',
      role: 'admin',
      house: 'none',
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    createUser(adminUser);
    console.log('Default admin created: admin@kvs / admin123');
  }
}
