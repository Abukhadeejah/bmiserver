const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function manageUsers() {
  try {
    console.log('🔐 User Management System\n');
    
    while (true) {
      console.log('\nChoose an option:');
      console.log('1. List all users');
      console.log('2. Add new user');
      console.log('3. Update user');
      console.log('4. Delete user');
      console.log('5. Exit');
      
      const choice = await question('\nEnter your choice (1-5): ');
      
      switch (choice) {
        case '1':
          await listUsers();
          break;
        case '2':
          await addUser();
          break;
        case '3':
          await updateUser();
          break;
        case '4':
          await deleteUser();
          break;
        case '5':
          console.log('👋 Goodbye!');
          return;
        default:
          console.log('❌ Invalid choice. Please try again.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

async function listUsers() {
  console.log('\n📋 All Users:');
  const users = await prisma.userPass.findMany();
  if (users.length === 0) {
    console.log('No users found.');
    return;
  }
  
  users.forEach(user => {
    console.log(`ID: ${user.id} | Username: ${user.username} | Password: ${user.password} | Role: ${user.role} | Active: ${user.isActive}`);
  });
}

async function addUser() {
  console.log('\n➕ Add New User:');
  
  const username = await question('Enter username: ');
  const password = await question('Enter password: ');
  const role = await question('Enter role (admin/staff/ADMIN/STAFF): ');
  
  if (!username || !password || !role) {
    console.log('❌ All fields are required');
    return;
  }
  
  if (!['admin', 'staff', 'ADMIN', 'STAFF'].includes(role)) {
    console.log('❌ Invalid role. Must be admin, staff, ADMIN, or STAFF');
    return;
  }
  
  try {
    const newUser = await prisma.userPass.create({
      data: {
        username: username,
        password: password,
        role: role,
        isActive: true
      }
    });
    
    console.log(`✅ User created: ${newUser.username} (${newUser.role})`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Username already exists');
    } else {
      console.log('❌ Error creating user:', error.message);
    }
  }
}

async function updateUser() {
  console.log('\n✏️ Update User:');
  
  // List users first
  const users = await prisma.userPass.findMany();
  if (users.length === 0) {
    console.log('No users to update.');
    return;
  }
  
  console.log('Available users:');
  users.forEach(user => {
    console.log(`ID: ${user.id} | Username: ${user.username} | Role: ${user.role}`);
  });
  
  const userId = await question('\nEnter user ID to update: ');
  const user = await prisma.userPass.findUnique({
    where: { id: parseInt(userId) }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log(`\nUpdating user: ${user.username}`);
  const newUsername = await question(`New username (current: ${user.username}): `) || user.username;
  const newPassword = await question(`New password (current: ${user.password}): `) || user.password;
  const newRole = await question(`New role (current: ${user.role}): `) || user.role;
  
  if (!['admin', 'staff', 'ADMIN', 'STAFF'].includes(newRole)) {
    console.log('❌ Invalid role. Must be admin, staff, ADMIN, or STAFF');
    return;
  }
  
  try {
    const updatedUser = await prisma.userPass.update({
      where: { id: parseInt(userId) },
      data: {
        username: newUsername,
        password: newPassword,
        role: newRole
      }
    });
    
    console.log(`✅ User updated: ${updatedUser.username} (${updatedUser.role})`);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Username already exists');
    } else {
      console.log('❌ Error updating user:', error.message);
    }
  }
}

async function deleteUser() {
  console.log('\n🗑️ Delete User:');
  
  // List users first
  const users = await prisma.userPass.findMany();
  if (users.length === 0) {
    console.log('No users to delete.');
    return;
  }
  
  console.log('Available users:');
  users.forEach(user => {
    console.log(`ID: ${user.id} | Username: ${user.username} | Role: ${user.role}`);
  });
  
  const userId = await question('\nEnter user ID to delete: ');
  const user = await prisma.userPass.findUnique({
    where: { id: parseInt(userId) }
  });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  const confirm = await question(`Are you sure you want to delete ${user.username}? (yes/no): `);
  
  if (confirm.toLowerCase() === 'yes') {
    try {
      await prisma.userPass.delete({
        where: { id: parseInt(userId) }
      });
      
      console.log(`✅ User deleted: ${user.username}`);
    } catch (error) {
      console.log('❌ Error deleting user:', error.message);
    }
  } else {
    console.log('❌ Deletion cancelled');
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

manageUsers(); 