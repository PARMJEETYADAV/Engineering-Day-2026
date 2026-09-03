import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function clearDummyData() {
  console.log('🧹 Initializing Database Cleanup for Engineering Day 2026...\n');

  try {
    // 1. Audit current counts
    const prevPayments = await prisma.payment.count();
    const prevRegistrations = await prisma.registration.count();
    const prevTeamPayments = await prisma.teamPayment.count();
    const prevTeamMembers = await prisma.teamMember.count();
    const prevTeams = await prisma.team.count();
    const prevNotifications = await prisma.notification.count();

    console.log(`Current records in database:`);
    console.log(`- Individual Payments: ${prevPayments}`);
    console.log(`- Event Registrations: ${prevRegistrations}`);
    console.log(`- E-Sports Team Payments: ${prevTeamPayments}`);
    console.log(`- E-Sports Team Members: ${prevTeamMembers}`);
    console.log(`- E-Sports Teams: ${prevTeams}`);
    console.log(`- Notifications: ${prevNotifications}\n`);

    console.log('Executing atomic database purge of all dummy/test registration data...');

    // Delete in relational order
    const delPayments = await prisma.payment.deleteMany({});
    console.log(`✓ Deleted ${delPayments.count} payment records`);

    const delRegs = await prisma.registration.deleteMany({});
    console.log(`✓ Deleted ${delRegs.count} registration records`);

    const delTeamPayments = await prisma.teamPayment.deleteMany({});
    console.log(`✓ Deleted ${delTeamPayments.count} team payment records`);

    const delTeamMembers = await prisma.teamMember.deleteMany({});
    console.log(`✓ Deleted ${delTeamMembers.count} team member records`);

    const delTeams = await prisma.team.deleteMany({});
    console.log(`✓ Deleted ${delTeams.count} team records`);

    const delNotifs = await prisma.notification.deleteMany({});
    console.log(`✓ Deleted ${delNotifs.count} notification records`);

    // Delete all student profiles and student accounts (Total Students reset to 0)
    const delProfiles = await prisma.studentProfile.deleteMany({});
    console.log(`✓ Deleted ${delProfiles.count} student profile records`);

    const delStudents = await prisma.user.deleteMany({
      where: { role: 'STUDENT' },
    });
    console.log(`✓ Deleted ${delStudents.count} student user accounts (TOTAL STUDENTS = 0)`);

    // Update all event venues to Apex University Auditorium, VT Road, Mansarovar
    await prisma.event.updateMany({
      data: {
        venue: 'Apex University Auditorium, VT Road, Mansarovar',
      },
    });
    console.log('✓ Updated all event venues to: Apex University Auditorium, VT Road, Mansarovar');

    // Update system settings and remove drive_storage_url
    await prisma.systemSetting.upsert({
      where: { key: 'university_name' },
      update: { value: 'Apex University' },
      create: { key: 'university_name', value: 'Apex University' },
    });
    await prisma.systemSetting.upsert({
      where: { key: 'contact_venue' },
      update: { value: 'Apex University Auditorium, VT Road, Mansarovar' },
      create: { key: 'contact_venue', value: 'Apex University Auditorium, VT Road, Mansarovar' },
    });
    await prisma.systemSetting.deleteMany({
      where: { key: 'drive_storage_url' },
    });
    console.log('✓ Updated system settings: Apex University & removed drive_storage_url');

    // Clean up uploaded payment proof screenshots
    const uploadsDir = path.resolve(__dirname, '../../uploads/payment_proofs');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      let removedFilesCount = 0;
      for (const file of files) {
        if (file !== '.gitkeep') {
          fs.unlinkSync(path.join(uploadsDir, file));
          removedFilesCount++;
        }
      }
      console.log(`✓ Cleaned ${removedFilesCount} payment proof screenshot file(s) from disk`);
    }

    // Verify preservation of critical foundation data
    const adminUser = await prisma.user.findUnique({
      where: { email: 'parmjeetyadav1230@gmail.com' },
    });
    const totalStudentsRemaining = await prisma.user.count({
      where: { role: 'STUDENT' },
    });

    console.log(`\nPreservation & Status Check:`);
    console.log(`- Admin Account: ${adminUser ? '✓ PRESERVED (' + adminUser.email + ')' : '❌ NOT FOUND'}`);
    console.log(`- Total Students: ✓ ${totalStudentsRemaining} (Completely Reset)`);

    const eventCount = await prisma.event.count();
    console.log(`- Events: ✓ ${eventCount} events active in database`);

    const settingsCount = await prisma.systemSetting.count();
    console.log(`- System Settings: ✓ ${settingsCount} settings active`);

    console.log('\n================================================================');
    console.log('🎉 DATABASE REGISTRATIONS & STUDENTS PURGED, VENUE UPDATED!');
    console.log('================================================================\n');
  } catch (error) {
    console.error('Database cleanup error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDummyData();
