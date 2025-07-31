const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminHash = bcrypt.hashSync('admin123', 10);
  
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: adminHash,
      role: 'admin'
    }
  });
  
  console.log('✅ Admin user created: admin/admin123');
  
  // Create UserPass entries for Admin and Staff
  await prisma.userPass.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      isActive: true
    }
  });
  
  await prisma.userPass.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: 'staff123',
      role: 'staff',
      isActive: true
    }
  });
  
  console.log('✅ UserPass entries created:');
  console.log('   - Admin: admin/admin123');
  console.log('   - Staff: staff/staff123');
  
  // Create sample members matching your data
  await prisma.member.upsert({
    where: { memberId: 'M001' },
    update: {},
    create: {
      memberId: 'M001',
      name: 'John Doe',
      phone: '9876543210',
      email: 'john.doe@example.com',
      dateOfBirth: new Date('1990-01-15'),
      relationshipStatus: 'Single',
      serviceLooking: 'Member',
      platform: 'Member',
      customerType: 'new'
    }
  });
  
  await prisma.member.upsert({
    where: { memberId: 'M002' },
    update: {},
    create: {
      memberId: 'M002',
      name: 'Tressa Thomas',
      phone: '8976700257',
      email: 'tressa.thomas14@gmail.com',
      dateOfBirth: new Date('1997-11-14'),
      relationshipStatus: 'Single',
      serviceLooking: 'Member',
      platform: 'Member',
      customerType: 'existing'
    }
  });
  
  console.log('✅ Sample members created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
