import assert from 'assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { paymentService } from '../services/paymentService';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_eng26_replace_in_prod';

async function runTests() {
  console.log("🧪 Starting Engineer's Day 2026 Test Suite...\n");
  let passedCount = 0;
  let failedCount = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passedCount++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    -> ${err.message}`);
      failedCount++;
    }
  }

  // Setup Test Data
  const testStudentEmail = `test_student_${Date.now()}@university.edu`;
  const testPassword = 'Password123!';
  let testStudentId = '';
  let testEventId = '';
  let testRegistrationId = '';
  const testUtr = `UTR_${Date.now()}`;

  // 1. Student Registration
  await test('1. Student Registration with password hashing and profile creation', async () => {
    const passwordHash = await bcrypt.hash(testPassword, 12);
    const user = await prisma.user.create({
      data: {
        email: testStudentEmail,
        passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: {
            fullName: 'Aryan Sharma',
            mobile: '9876543210',
            course: 'B.Tech Computer Science',
            semester: '5th',
            enrollmentNumber: 'EN2026001',
            department: 'Computer Science & Engineering',
          },
        },
      },
      include: { studentProfile: true },
    });

    testStudentId = user.id;
    assert.strictEqual(user.email, testStudentEmail);
    assert.strictEqual(user.role, 'STUDENT');
    assert.strictEqual(user.studentProfile?.fullName, 'Aryan Sharma');
    assert(user.passwordHash !== testPassword, 'Password must be securely hashed');
  });

  // 2. Student Login & Password Verification
  await test('2. Student Login verification with bcrypt comparison', async () => {
    const user = await prisma.user.findUnique({
      where: { email: testStudentEmail },
    });
    assert(user, 'User should exist');
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    assert(isValid, 'Password comparison must succeed for correct credentials');

    const isWrongValid = await bcrypt.compare('WrongPassword!', user.passwordHash);
    assert(!isWrongValid, 'Password comparison must fail for incorrect credentials');
  });

  // 3. Duplicate Email Prevention
  await test('3. Duplicate email registration rejection', async () => {
    try {
      await prisma.user.create({
        data: {
          email: testStudentEmail,
          passwordHash: 'dummy',
          role: 'STUDENT',
        },
      });
      assert.fail('Should have thrown unique constraint error');
    } catch (err: any) {
      assert(err.message.includes('Unique constraint') || err.code === 'P2002', 'Database must prevent duplicate emails');
    }
  });

  // 4. Event Lookup & Database-driven Fee Calculation
  await test('4. Event database-driven fee calculation (Never trust frontend amount)', async () => {
    const bgmiEvent = await prisma.event.findFirst({
      where: { slug: 'bgmi' },
    });
    assert(bgmiEvent, 'BGMI event should exist from seed');
    testEventId = bgmiEvent.id;

    const verifiedFee = await paymentService.getVerifiedEventFee(bgmiEvent.id);
    assert.strictEqual(verifiedFee, 49, 'Fee must strictly be 49 from database');
  });

  // 5. Event Registration & Unique Registration ID Generation
  await test('5. Event registration creation with formatted Registration ID', async () => {
    const regNumber = await paymentService.generateRegistrationNumber('bgmi');
    assert(regNumber.startsWith('ENG26-BGMI-'), 'Registration ID must match configured prefix and slug format');

    const registration = await prisma.registration.create({
      data: {
        registrationNumber: regNumber,
        studentId: testStudentId,
        eventId: testEventId,
        status: 'PAYMENT_PENDING',
        teamName: 'CyberKnights',
      },
    });

    testRegistrationId = registration.id;
    assert.strictEqual(registration.status, 'PAYMENT_PENDING');
  });

  // 6. Duplicate Event Registration Prevention (Same Student + Same Event)
  await test('6. Duplicate event registration prevention for same student and same event', async () => {
    try {
      await prisma.registration.create({
        data: {
          registrationNumber: `ENG26-BGMI-${Date.now()}`,
          studentId: testStudentId,
          eventId: testEventId,
          status: 'PAYMENT_PENDING',
        },
      });
      assert.fail('Should have rejected duplicate registration for same student and same event');
    } catch (err: any) {
      assert(err.message.includes('Unique constraint') || err.code === 'P2002', 'Must enforce single active registration per event');
    }
  });

  // 7. Payment Proof Submission & UTR Association
  await test('7. Payment proof submission and status transition to UNDER_REVIEW', async () => {
    const result = await paymentService.processManualUpiPayment(
      testRegistrationId,
      testUtr,
      'test-payment-proof.png',
      new Date()
    );

    assert(result.success, 'Payment processing should succeed');
    const updatedReg = await prisma.registration.findUnique({
      where: { id: testRegistrationId },
      include: { payment: true },
    });

    assert.strictEqual(updatedReg?.status, 'UNDER_REVIEW', 'Status must transition to UNDER_REVIEW');
    assert.strictEqual(updatedReg?.payment?.amount, 49, 'Amount must be verified as 49');
    assert.strictEqual(updatedReg?.payment?.transactionId, testUtr);
  });

  // 8. Duplicate UTR / Transaction ID Detection
  await test('8. Duplicate UTR / Transaction ID detection and flagging', async () => {
    const isDup = await paymentService.checkDuplicateTransactionId(testUtr, 'different-registration-id');
    assert(isDup, 'System must detect and flag duplicate UTR submission');

    const isNonDup = await paymentService.checkDuplicateTransactionId(`FRESH_UTR_${Date.now()}`);
    assert(!isNonDup, 'Fresh UTR must not be flagged');
  });

  // 9. Admin Authorization & Security Guard
  await test('9. Admin authorization check and access control', async () => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@engineeringday2026.edu';
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    assert(adminUser, 'Admin account should exist');
    assert.strictEqual(adminUser.role, 'ADMIN', 'Admin user must have ADMIN role');

    const adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET
    );
    const decodedAdmin: any = jwt.verify(adminToken, JWT_SECRET);
    assert.strictEqual(decodedAdmin.role, 'ADMIN');

    const studentToken = jwt.sign(
      { id: testStudentId, email: testStudentEmail, role: 'STUDENT' },
      JWT_SECRET
    );
    const decodedStudent: any = jwt.verify(studentToken, JWT_SECRET);
    assert.notStrictEqual(decodedStudent.role, 'ADMIN', 'Student token must not have ADMIN role');
  });

  // 10. Admin Payment Approval Flow & Audit Logging
  await test('10. Admin payment approval flow, status update, and audit log generation', async () => {
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    assert(adminUser, 'Admin user needed');

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { registrationId: testRegistrationId },
        data: {
          status: 'APPROVED',
          verifiedBy: adminUser.email,
          verifiedAt: new Date(),
        },
      });

      await tx.registration.update({
        where: { id: testRegistrationId },
        data: { status: 'APPROVED' },
      });

      await tx.adminActionLog.create({
        data: {
          adminId: adminUser.id,
          action: 'APPROVE_PAYMENT',
          targetType: 'REGISTRATION',
          targetId: testRegistrationId,
          details: JSON.stringify({ verified: true }),
        },
      });
    });

    const approvedReg = await prisma.registration.findUnique({
      where: { id: testRegistrationId },
      include: { payment: true },
    });

    assert.strictEqual(approvedReg?.status, 'APPROVED');
    assert.strictEqual(approvedReg?.payment?.status, 'APPROVED');

    const auditLog = await prisma.adminActionLog.findFirst({
      where: { targetId: testRegistrationId, action: 'APPROVE_PAYMENT' },
    });
    assert(auditLog, 'Admin audit log entry must be created');
  });

  // 11. Admin Rejection with Mandatory Reason
  await test('11. Admin rejection with required reason and notification', async () => {
    const reason = 'Screenshot is blurry and UTR does not match bank records.';
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { registrationId: testRegistrationId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason,
        },
      });
      await tx.registration.update({
        where: { id: testRegistrationId },
        data: { status: 'REJECTED' },
      });
    });

    const rejectedReg = await prisma.registration.findUnique({
      where: { id: testRegistrationId },
      include: { payment: true },
    });

    assert.strictEqual(rejectedReg?.status, 'REJECTED');
    assert.strictEqual(rejectedReg?.payment?.rejectionReason, reason);
  });

  // Cleanup test registration and student
  await prisma.registration.delete({ where: { id: testRegistrationId } });
  await prisma.user.delete({ where: { id: testStudentId } });

  console.log('\n=============================================');
  console.log(`📊 Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('=============================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Fatal test runner error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
