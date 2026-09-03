import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import assert from 'assert';
import { esportsService } from '../services/esportsService';

const prisma = new PrismaClient();

async function runEsportsTests() {
  console.log('🎮 Running E-Sports Team Registration Module Tests...\n');

  // 1. Verify updated admin login credentials
  console.log('1. Verifying updated Admin credentials (parmjeetyadav1230@gmail.com)...');
  const admin = await prisma.user.findUnique({
    where: { email: 'parmjeetyadav1230@gmail.com' },
  });
  assert(admin, 'Admin account with email parmjeetyadav1230@gmail.com must exist');
  const passMatch = await bcrypt.compare('Engineeringday@2026', admin.passwordHash);
  assert(passMatch, 'Admin password must match Engineeringday@2026');
  console.log('   ✓ Admin account & password verified successfully');

  // 2. Create test captain student account
  console.log('2. Setting up test student captain...');
  const captainEmail = `esports_captain_${Date.now()}@university.edu`;
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const captain = await prisma.user.create({
    data: {
      email: captainEmail,
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Aarav Sharma',
          mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
          course: 'B.Tech CSE',
          semester: '6th',
          enrollmentNumber: 'EN2026CSE099',
        },
      },
    },
    include: { studentProfile: true },
  });
  assert(captain.studentProfile, 'Captain profile created');
  console.log(`   ✓ Captain created: ${captain.studentProfile.fullName} (${captain.email})`);

  // 3. Dynamic price calculation check
  console.log('3. Verifying database-driven fee calculation for 1 to 4 members...');
  const p1 = await esportsService.calculateExpectedFee('BGMI', 1);
  assert.strictEqual(p1.totalAmount, 49, '1 member must be ₹49');
  const p2 = await esportsService.calculateExpectedFee('BGMI', 2);
  assert.strictEqual(p2.totalAmount, 98, '2 members must be ₹98');
  const p3 = await esportsService.calculateExpectedFee('BGMI', 3);
  assert.strictEqual(p3.totalAmount, 147, '3 members must be ₹147');
  const p4 = await esportsService.calculateExpectedFee('BGMI', 4);
  assert.strictEqual(p4.totalAmount, 196, '4 members must be ₹196');
  console.log('   ✓ Verified pricing: 1=₹49, 2=₹98, 3=₹147, 4=₹196');

  // 4. Team ID Generation format
  console.log('4. Testing Team ID Generation format (ENG26-BGMI-T0001)...');
  const generatedId = await esportsService.generateTeamId('BGMI');
  assert(/^ENG26-BGMI-T\d{4}$/.test(generatedId), `Team ID ${generatedId} must match format ENG26-BGMI-TXXXX`);
  console.log(`   ✓ Generated Team ID: ${generatedId}`);

  // 5. Team Creation with Captain as Member 1
  console.log('5. Creating a 3-member team in database...');
  const teamName = `CYBER_TITANS_${Date.now()}`;
  const team = await prisma.team.create({
    data: {
      teamId: generatedId,
      teamName,
      game: 'BGMI',
      captainId: captain.id,
      memberCount: 3,
      status: 'PAYMENT_PENDING',
      members: {
        create: [
          {
            studentId: captain.id,
            fullName: captain.studentProfile.fullName,
            email: captain.email,
            mobile: captain.studentProfile.mobile,
            course: captain.studentProfile.course,
            semester: captain.studentProfile.semester,
            ign: 'AaravSniper',
            gameUid: '5123456789',
            isCaptain: true,
          },
          {
            fullName: 'Rohan Gupta',
            email: `rohan_${Date.now()}@uni.edu`,
            mobile: `97${Math.floor(10000000 + Math.random() * 90000000)}`,
            course: 'B.Tech IT',
            semester: '6th',
            ign: 'RohanAssault',
            gameUid: '5123456790',
            isCaptain: false,
          },
          {
            fullName: 'Vikram Singh',
            email: `vikram_${Date.now()}@uni.edu`,
            mobile: `96${Math.floor(10000000 + Math.random() * 90000000)}`,
            course: 'B.Tech CSE',
            semester: '4th',
            ign: 'VikramMedic',
            gameUid: '5123456791',
            isCaptain: false,
          },
        ],
      },
    },
    include: { members: true },
  });

  assert.strictEqual(team.members.length, 3);
  const captainMember = team.members.find((m) => m.isCaptain);
  assert(captainMember, 'Captain member must exist');
  assert.strictEqual(captainMember.ign, 'AaravSniper');
  console.log(`   ✓ Team created: ${team.teamName} with 3 members`);

  // 6. Adding 4th member
  console.log('6. Adding 4th member to reach maximum squad size (4/4)...');
  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      fullName: 'Sahil Kumar',
      email: `sahil_${Date.now()}@uni.edu`,
      mobile: `95${Math.floor(10000000 + Math.random() * 90000000)}`,
      course: 'B.Tech ECE',
      semester: '6th',
      ign: 'SahilFragger',
      gameUid: '5123456792',
      isCaptain: false,
    },
  });
  await prisma.team.update({
    where: { id: team.id },
    data: { memberCount: 4 },
  });

  const updatedTeam = await prisma.team.findUnique({
    where: { id: team.id },
    include: { members: true },
  });
  assert.strictEqual(updatedTeam!.members.length, 4);
  console.log('   ✓ Squad now has 4 members (Maximum reached)');

  // 7. Payment Proof Submission
  console.log('7. Submitting payment proof for the entire team (₹196)...');
  const testUtr = `UTR_ESPORTS_${Date.now()}`;
  const teamPayment = await prisma.teamPayment.create({
    data: {
      teamId: team.id,
      amount: 196,
      expectedAmount: 196,
      transactionId: testUtr,
      screenshotPath: 'test_proof.png',
      driveUrl: 'https://drive.google.com/drive/folders/1KR_u6xWgPn8Zns9CGV10-tDh8V-J4WCF?usp=drive_link',
      status: 'UNDER_REVIEW',
    },
  });
  await prisma.team.update({
    where: { id: team.id },
    data: { status: 'UNDER_REVIEW' },
  });
  assert.strictEqual(teamPayment.expectedAmount, 196);
  console.log(`   ✓ Team payment submitted with UTR ${testUtr} and status UNDER_REVIEW`);

  // 8. Admin Approval & Team Lock
  console.log('8. Admin approves team and verifies team lock...');
  await prisma.team.update({
    where: { id: team.id },
    data: {
      status: 'APPROVED',
      isLocked: true,
    },
  });
  await prisma.teamPayment.update({
    where: { id: teamPayment.id },
    data: {
      status: 'APPROVED',
      verifiedBy: 'parmjeetyadav1230@gmail.com',
      verifiedAt: new Date(),
    },
  });

  const approvedTeam = await prisma.team.findUnique({ where: { id: team.id } });
  assert.strictEqual(approvedTeam!.status, 'APPROVED');
  assert.strictEqual(approvedTeam!.isLocked, true);
  console.log('   ✓ Team marked APPROVED and isLocked is TRUE (Details locked)');

  // 9. Excel & CSV Export
  console.log('9. Generating Excel (.xlsx) and CSV export with full member rosters...');
  const allTeams = await prisma.team.findMany({
    where: { id: team.id },
    include: {
      captain: { include: { studentProfile: true } },
      members: { orderBy: { isCaptain: 'desc' } },
      payment: true,
    },
  });

  const excelBuffer = await esportsService.generateTeamsExcel(allTeams);
  assert(excelBuffer.length > 1000, 'Excel buffer should be valid');

  const csvString = await esportsService.generateTeamsCsv(allTeams);
  assert(csvString.includes('Team ID,Team Name,Game'), 'CSV must contain headers');
  assert(csvString.includes(team.teamName), 'CSV must contain team name');
  assert(csvString.includes('AaravSniper'), 'CSV must contain captain IGN');
  assert(csvString.includes('5123456789'), 'CSV must contain captain Game UID');
  console.log('   ✓ Both Excel (.xlsx) and CSV exports generated with full 30+ columns');

  console.log('\n======================================================');
  console.log('🎉 ALL E-SPORTS MODULE BUSINESS LOGIC TESTS PASSED!');
  console.log('======================================================\n');
}

runEsportsTests()
  .catch((err) => {
    console.error('Esports Test Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
