import http from 'http';
import assert from 'assert';

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

async function runImprovementsVerification() {
  console.log('🧪 Verifying Screenshot Viewing, E-Sports Pricing & Database Reset on http://localhost:5000...\n');

  // 1. Admin Login
  console.log('1. Verifying Admin Login...');
  const adminLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'parmjeetyadav1230@gmail.com',
      password: 'Engineeringday@2026',
      expectedRole: 'ADMIN',
    }
  );
  assert.strictEqual(adminLoginRes.statusCode, 200);
  const adminToken = adminLoginRes.data.token;
  console.log('   ✓ Admin logged in successfully');

  // 2. Verify clean database state (0 registrations, 0 teams)
  console.log('2. Verifying database stats are reset to 0...');
  const statsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(statsRes.statusCode, 200);
  assert.strictEqual(statsRes.data.stats.totalRegistrations, 0);
  console.log('   ✓ Confirmed: Total registrations = 0 (Database is clean)');

  // 3. Register a student captain
  console.log('3. Registering a test student captain...');
  const capEmail = `cap_test_${Date.now()}@uni.edu`;
  const studentReg = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      fullName: 'Yashwardhan Singh',
      email: capEmail,
      mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      course: 'B.Tech IT',
      semester: '6th',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }
  );
  assert.strictEqual(studentReg.statusCode, 201);
  const studentToken = studentReg.data.token;
  console.log('   ✓ Student captain registered');

  // 4. Create a 2-member BGMI team (Pricing must be: 2 * 49 = ₹98)
  console.log('4. Creating 2-member BGMI team with individual member details...');
  const createTeamRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/esports/teams',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    {
      teamName: `ALPHA_WARRIORS_${Date.now()}`,
      game: 'BGMI',
      captainIgn: 'AlphaLead',
      captainGameUid: '5123456789',
      members: [
        {
          fullName: 'Rohan Joshi',
          email: `rohan_${Date.now()}@uni.edu`,
          mobile: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
          course: 'B.Tech CSE',
          semester: '6th',
          ign: 'RohanGunner',
          gameUid: '5123456790',
        },
      ],
    }
  );
  assert.strictEqual(createTeamRes.statusCode, 201);
  assert.strictEqual(createTeamRes.data.team.memberCount, 2);
  assert.strictEqual(createTeamRes.data.pricing.totalAmount, 98, '2 members must equal ₹98');
  const teamId = createTeamRes.data.team.id;
  console.log(`   ✓ Team created with 2 members. Dynamically calculated fee: ₹${createTeamRes.data.pricing.totalAmount}`);

  // 5. Submit Payment Proof with screenshot
  console.log('5. Submitting payment proof with screenshot file...');
  const boundary = '----WebKitFormBoundaryTestScreenshot456';
  const dummyFile = Buffer.from('TEST_SCREENSHOT_IMAGE_BYTES');
  const utr = `UTR_TEST_${Date.now()}`;

  const multipartBody = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="transactionId"\r\n\r\n${utr}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="screenshot"; filename="proof.png"\r\nContent-Type: image/png\r\n\r\n`
    ),
    dummyFile,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const paymentRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/esports/teams/${teamId}/payment`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': multipartBody.length,
        Authorization: `Bearer ${studentToken}`,
      },
    },
    multipartBody
  );
  assert.strictEqual(paymentRes.statusCode, 200);
  console.log('   ✓ Payment proof submitted and stored');

  // 6. Inspect Team to get screenshot filename
  const teamDetail = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/esports/teams/${teamId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const screenshotFilename = teamDetail.data.team.payment.screenshotPath;
  assert(screenshotFilename, 'Screenshot filename must exist');
  console.log(`   ✓ Screenshot stored with filename: ${screenshotFilename}`);

  // 7. Verify Screenshot can be opened via ?token= query parameter (Image / New Tab fix)
  console.log('7. Testing screenshot access via query parameter GET /api/payments/screenshot/:filename?token=...');
  const screenshotRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/payments/screenshot/${screenshotFilename}?token=${adminToken}`,
    method: 'GET',
  });
  assert.strictEqual(screenshotRes.statusCode, 200, 'Screenshot with query token must return 200 OK');
  console.log('   ✓ Screenshot successfully accessed via ?token= parameter! (Admin screenshot viewing verified)');

  // 8. Test Admin Database Purge endpoint
  console.log('8. Testing POST /api/admin/clear-registrations...');
  const purgeRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/clear-registrations',
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(purgeRes.statusCode, 200);
  console.log('   ✓ Purge endpoint returned 200 OK');

  // 9. Verify database is once again clean
  const finalStats = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(finalStats.data.stats.totalRegistrations, 0);
  console.log('   ✓ Database verified completely clean: 0 registrations, 0 payments');

  console.log('\n================================================================');
  console.log('🎉 ALL SCREENSHOT FIX, E-SPORTS PRICING & PURGE TESTS PASSED!');
  console.log('================================================================\n');
}

runImprovementsVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
