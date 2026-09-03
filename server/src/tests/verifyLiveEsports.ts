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

async function runLiveEsportsVerification() {
  console.log('🚀 Running Live E-Sports HTTP API End-to-End Verification on http://localhost:5000...\n');

  // 1. Admin Login with new credentials
  console.log('1. Verifying Admin Login with parmjeetyadav1230@gmail.com / Engineeringday@2026...');
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
  assert.strictEqual(adminLoginRes.statusCode, 200, 'Admin login must return 200 OK');
  const adminToken = adminLoginRes.data.token;
  console.log('   ✓ Admin authenticated successfully. JWT token issued.');

  // 2. Student Registration
  console.log('2. Registering a test student captain...');
  const captainEmail = `esports_live_cap_${Date.now()}@university.edu`;
  const dynamicMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

  const studentRegRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      fullName: 'Vikramaditya Rao',
      email: captainEmail,
      mobile: dynamicMobile,
      course: 'B.Tech CSE',
      semester: '6th',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }
  );
  assert.strictEqual(studentRegRes.statusCode, 201);
  const studentToken = studentRegRes.data.token;
  console.log(`   ✓ Student registered and token received: ${captainEmail}`);

  // 3. Create a 3-member BGMI Team
  console.log('3. Creating 3-member BGMI Team via POST /api/esports/teams (Price check: ₹147)...');
  const teamName = `PHOENIX_CLAN_${Date.now()}`;
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
      teamName,
      game: 'BGMI',
      captainIgn: 'PhoenixLead',
      captainGameUid: '5987654321',
      members: [
        {
          fullName: 'Karan Mehra',
          email: `karan_${Date.now()}@uni.edu`,
          mobile: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
          course: 'B.Tech IT',
          semester: '6th',
          ign: 'KaranAssault',
          gameUid: '5987654322',
        },
        {
          fullName: 'Naveen Kumar',
          email: `naveen_${Date.now()}@uni.edu`,
          mobile: `92${Math.floor(10000000 + Math.random() * 90000000)}`,
          course: 'B.Tech CSE',
          semester: '4th',
          ign: 'NaveenSniper',
          gameUid: '5987654323',
        },
      ],
    }
  );

  assert.strictEqual(createTeamRes.statusCode, 201);
  assert.strictEqual(createTeamRes.data.team.memberCount, 3);
  assert.strictEqual(createTeamRes.data.pricing.totalAmount, 147, '3 members must equal ₹147');
  const createdTeam = createTeamRes.data.team;
  console.log(`   ✓ Team created: ${createdTeam.teamName} (${createdTeam.teamId}) with 3 members, Fee: ₹147`);

  // 4. Dynamically add 4th member
  console.log('4. Dynamically adding 4th member via POST /api/esports/teams/:id/members (Price check: ₹196)...');
  const addMemberRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/esports/teams/${createdTeam.id}/members`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    {
      fullName: 'Devendra Patel',
      email: `devendra_${Date.now()}@uni.edu`,
      mobile: `93${Math.floor(10000000 + Math.random() * 90000000)}`,
      course: 'B.Tech ECE',
      semester: '6th',
      ign: 'DevendraMedic',
      gameUid: '5987654324',
    }
  );

  assert.strictEqual(addMemberRes.statusCode, 200);
  assert.strictEqual(addMemberRes.data.team.memberCount, 4);
  assert.strictEqual(addMemberRes.data.pricing.totalAmount, 196, '4 members must equal ₹196');
  console.log('   ✓ 4th member added successfully. Squad size is 4/4, Total: ₹196');

  // 5. Attempt to add 5th member (must be rejected)
  console.log('5. Testing maximum squad bounds: attempting to add 5th member...');
  const add5thRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/esports/teams/${createdTeam.id}/members`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    {
      fullName: 'Fifth Player',
      email: `fifth_${Date.now()}@uni.edu`,
      mobile: '9412345678',
      course: 'B.Tech',
      semester: '6th',
      ign: 'ExtraPlayer',
      gameUid: '5987654325',
    }
  );
  assert.strictEqual(add5thRes.statusCode, 400);
  console.log('   ✓ Adding 5th member correctly rejected with 400 (Max 4 members enforced)');

  // 6. Submit Payment Proof
  console.log('6. Submitting payment proof via POST /api/esports/teams/:id/payment...');
  const testUtr = `UTR_ESPORTS_${Date.now()}`;
  const boundary = '----WebKitFormBoundaryEsportsTest789';
  const dummyImage = Buffer.from('FAKE_ESPORTS_PAYMENT_IMAGE');

  const paymentBody = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="transactionId"\r\n\r\n${testUtr}\r\n` +
      `--${boundary}\r\nContent-Disposition: form-data; name="screenshot"; filename="proof.png"\r\nContent-Type: image/png\r\n\r\n`
    ),
    dummyImage,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const submitPaymentRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/esports/teams/${createdTeam.id}/payment`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': paymentBody.length,
        Authorization: `Bearer ${studentToken}`,
      },
    },
    paymentBody
  );

  assert.strictEqual(submitPaymentRes.statusCode, 200);
  assert.strictEqual(submitPaymentRes.data.status, 'UNDER_REVIEW');
  console.log('   ✓ Payment proof submitted. Squad status transitioned to UNDER_REVIEW');

  // 7. Admin Inspection & Stats
  console.log('7. Admin inspecting squad dossier via GET /api/admin/esports/teams/:id...');
  const adminDetailRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/esports/teams/${createdTeam.id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(adminDetailRes.statusCode, 200);
  assert.strictEqual(adminDetailRes.data.team.members.length, 4);
  assert.strictEqual(adminDetailRes.data.pricing.totalAmount, 196);
  console.log('   ✓ Admin dossier retrieved with full 4-player roster and expected amount ₹196');

  // 8. Admin Approval & Team Lock
  console.log('8. Admin approving squad via PATCH /api/admin/esports/teams/:id/approve...');
  const approveRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/esports/teams/${createdTeam.id}/approve`,
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(approveRes.statusCode, 200);
  console.log('   ✓ Squad approved successfully');

  // 9. Verify Team Lock: Member modification blocked after approval
  console.log('9. Verifying Team Lock: student attempts to delete a member from approved team...');
  const memberToDelete = adminDetailRes.data.team.members.find((m: any) => !m.isCaptain);
  const deleteRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/esports/teams/${createdTeam.id}/members/${memberToDelete.id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert.strictEqual(deleteRes.statusCode, 400);
  console.log('   ✓ Member deletion on approved team rejected with 400 (TEAM LOCKED enforced)');

  // 10. Admin Export (Excel & CSV)
  console.log('10. Verifying E-Sports Teams Excel and CSV exports...');
  const excelExportRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/esports/export?format=excel',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(excelExportRes.statusCode, 200);
  assert(excelExportRes.headers['content-type']?.includes('spreadsheetml'));
  console.log('   ✓ E-Sports Excel export generated and streamed');

  const csvExportRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/esports/export?format=csv',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.strictEqual(csvExportRes.statusCode, 200);
  assert(typeof csvExportRes.data === 'string' && csvExportRes.data.includes('Team ID,Team Name,Game'));
  console.log('   ✓ E-Sports CSV export generated and streamed');

  console.log('\n========================================================================');
  console.log('🎉 ALL LIVE HTTP E-SPORTS MODULE VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================================\n');
}

runLiveEsportsVerification().catch((err) => {
  console.error('Live Verification Error:', err);
  process.exit(1);
});
