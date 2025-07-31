const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function addUser() {
  try {
    console.log('🔐 Add New User to Database\n');
    
    // Get user input
    const username = await question('Enter username: ');
    const password = await question('Enter password: ');
    const role = await question('Enter role (admin/staff): ');
    
    // Validate input
    if (!username || !password || !role) {
      console.log('❌ All fields are required');
      return;
    }
    
    if (!['admin', 'staff'].includes(role)) {
      console.log('❌ Role must be admin or staff');
      return;
    }
    
    if (username.length < 3) {
      console.log('❌ Username must be at least 3 characters');
      return;
    }
    
    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      return;
    }
    
    // Check if user already exists
    const existingUser = await prisma.userPass.findUnique({
      where: { username: username.toLowerCase() }
    });
    
    if (existingUser) {
      console.log('❌ Username already exists');
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const newUser = await prisma.userPass.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        role,
        isActive: true
      }
    });
    
    console.log('\n✅ User created successfully!');
    console.log(`Username: ${newUser.username}`);
    console.log(`Role: ${newUser.role}`);
    console.log(`Status: ${newUser.isActive ? 'Active' : 'Inactive'}`);
    
    // Show all users
    console.log('\n📋 All users in database:');
    const allUsers = await prisma.userPass.findMany();
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

addUser(); 