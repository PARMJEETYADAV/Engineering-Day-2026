import http from 'http';
import assert from 'assert';
import path from 'path';
import fs from 'fs';

async function request(options: http.RequestOptions, body?: any): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let parsed = rawData;
        try {
          parsed = JSON.parse(rawData);
        } catch {}
        resolve({
          statusCode: res.statusCode || 500,
          data: parsed,
          headers: res.headers,
        });
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'string') {
        req.write(body);
      } else if (Buffer.isBuffer(body)) {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
}

async function runE2E() {
  console.log('🌐 Running End-to-End Live HTTP API Verification on http://localhost:5000...\n');

  // 1. Health check
  console.log('1. Verifying /api/health...');
  const healthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  assert.strictEqual(healthRes.statusCode, 200);
  assert.strictEqual(healthRes.data.status, 'HEALTHY');
  console.log('   ✓ Health check returned 200 OK');

  // 2. Events list check
  console.log('2. Verifying /api/events (Checking Day 1 & Day 2 events, zero DJ presence)...');
  const eventsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'GET',
  });
  assert.strictEqual(eventsRes.statusCode, 200);
  assert(eventsRes.data.events.length >= 6, 'Should have all seeded events');
  const eventNames = eventsRes.data.events.map((e: any) => e.name);
  console.log(`   Found events: ${eventNames.join(', ')}`);

  // Verify NO DJ anywhere
  const allEventsString = JSON.stringify(eventsRes.data).toLowerCase();
  assert(!allEventsString.includes('dj celebration') && !allEventsString.includes('dj night'), 'Strict check: DJ celebration must NOT exist');
  console.log('   ✓ Confirmed zero occurrences of DJ celebration');

  // Find BGMI event
  const bgmi = eventsRes.data.events.find((e: any) => e.slug === 'bgmi');
  assert(bgmi, 'BGMI event should exist');
  assert.strictEqual(bgmi.registrationFee, 49, 'Fee should be 49');
  console.log('   ✓ BGMI fee verified as ₹49 from database');

  // 3. Student Registration
  console.log('3. Registering a test student account via POST /api/auth/register...');
  const studentEmail = `live_student_${Date.now()}@university.edu`;
  const dynamicMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
  const regPayload = {
    fullName: 'Pooja Verma',
    email: studentEmail,
    mobile: dynamicMobile,
    course: 'B.Tech Information Technology',
    semester: '6th',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  const studentRegRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    regPayload
  );

  assert.strictEqual(studentRegRes.statusCode, 201);
  assert(studentRegRes.data.token, 'Registration should return JWT token');
  const studentToken = studentRegRes.data.token;
  console.log('   ✓ Student registered and JWT issued successfully');

  // 4. Student Login
  console.log('4. Logging in as student via POST /api/auth/login...');
  const studentLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: studentEmail, password: 'Password123!' }
  );
  assert.strictEqual(studentLoginRes.statusCode, 200);
  console.log('   ✓ Student logged in successfully');

  // 5. Create Event Registration
  console.log('5. Creating event registration for BGMI via POST /api/registrations...');
  const createRegRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/registrations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    { eventId: bgmi.id, teamName: 'DeltaSquad' }
  );

  assert.strictEqual(createRegRes.statusCode, 201);
  const createdRegistration = createRegRes.data.registration;
  assert(createdRegistration.registrationNumber.startsWith('ENG26-BGMI-'), 'Must match format ENG26-BGMI-XXXXXX');
  assert.strictEqual(createdRegistration.status, 'PAYMENT_PENDING');
  console.log(`   ✓ Registration created with ID: ${createdRegistration.registrationNumber}`);

  // 6. Duplicate Registration Test
  console.log('6. Testing duplicate registration rejection for same student + same event...');
  const dupRegRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/registrations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    { eventId: bgmi.id }
  );

  assert.strictEqual(dupRegRes.statusCode, 409);
  console.log('   ✓ Duplicate registration correctly rejected with 409 Conflict');

  // 7. Payment submission test (using multipart boundary)
  console.log('7. Submitting payment proof via POST /api/payments/proof...');
  const testUtr = `UTR_${Date.now()}`;
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const dummyFileContent = Buffer.from('FAKE_PNG_BINARY_CONTENT');

  let bodyBuffer = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="registrationId"\r\n\r\n${createdRegistration.id}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="transactionId"\r\n\r\n${testUtr}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="screenshot"; filename="proof.png"\r\nContent-Type: image/png\r\n\r\n`
    ),
    dummyFileContent,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const paymentRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/payments/proof',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyBuffer.length,
        Authorization: `Bearer ${studentToken}`,
      },
    },
    bodyBuffer
  );

  assert.strictEqual(paymentRes.statusCode, 200);
  assert.strictEqual(paymentRes.data.status, 'UNDER_REVIEW');
  console.log('   ✓ Payment proof submitted. Status transitioned to UNDER_REVIEW');

  // 8. Admin Security & Login
  console.log('8. Testing admin security and login...');
  // First, verify student cannot access admin routes
  const unauthorizedRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.strictEqual(unauthorizedRes.statusCode, 403);
  console.log('   ✓ Student blocked from /api/admin/dashboard (403 Forbidden)');

  // Now login as Admin
  const adminLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@engineeringday2026.edu', password: 'AdminPass#2026!', expectedRole: 'ADMIN' }
  );
  if (adminLoginRes.statusCode !== 200) {
    console.error('Admin login response:', adminLoginRes.data);
  }
  assert.strictEqual(adminLoginRes.statusCode, 200);
  const adminToken = adminLoginRes.data.token;
  console.log('   ✓ Admin logged in successfully with admin privileges');

  // 9. Admin Dashboard Metrics
  console.log('9. Checking Admin Dashboard stats...');
  const adminDashRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(adminDashRes.statusCode, 200);
  assert(adminDashRes.data.stats.totalRegistrations >= 1);
  console.log(`   ✓ Admin stats retrieved: ${adminDashRes.data.stats.totalRegistrations} total registrations`);

  // 10. Admin Payment Approval
  console.log('10. Approving registration via PATCH /api/admin/registrations/:id/approve...');
  const approveRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/registrations/${createdRegistration.id}/approve`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(approveRes.statusCode, 200);
  console.log('   ✓ Registration approved and entry pass confirmed');

  // 11. Excel Export
  console.log('11. Testing Excel (.xlsx) export via /api/admin/export?format=excel...');
  const excelRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/export?format=excel',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(excelRes.statusCode, 200);
  assert(excelRes.headers['content-type']?.includes('spreadsheetml'), 'Content type must be Excel format');
  console.log('   ✓ Excel workbook generated and streamed successfully');

  // 12. CSV Export
  console.log('12. Testing CSV export via /api/admin/export?format=csv...');
  const csvRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/export?format=csv',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(csvRes.statusCode, 200);
  assert(typeof csvRes.data === 'string' && csvRes.data.includes('Registration ID'), 'CSV headers must match');
  console.log('   ✓ CSV spreadsheet generated and streamed successfully');

  console.log('\n======================================================');
  console.log('🎉 ALL LIVE END-TO-END SYSTEM TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runE2E().catch((err) => {
  console.error('E2E Verification Error:', err);
  process.exit(1);
});
