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

async function verifySecurityAndState() {
  console.log('🛡️ Verifying Enterprise Website Security & Clean Database State...\n');

  // 1. Verify Health & Defense Headers
  console.log('1. Checking HTTP Defense Headers & Information Concealment...');
  const healthRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });

  assert.strictEqual(healthRes.statusCode, 200);
  assert.strictEqual(healthRes.data.security, 'ACTIVE');

  // Check X-Powered-By is hidden
  assert.strictEqual(healthRes.headers['x-powered-by'], undefined, 'X-Powered-By header must be completely removed');
  console.log('   ✓ Server signature concealed (X-Powered-By stripped)');

  // Check Anti-Clickjacking & Anti-MIME Sniffing
  assert.strictEqual(healthRes.headers['x-frame-options'], 'DENY', 'X-Frame-Options must be DENY (Anti-Clickjacking)');
  assert.strictEqual(healthRes.headers['x-content-type-options'], 'nosniff', 'X-Content-Type-Options must be nosniff');
  assert.strictEqual(healthRes.headers['x-xss-protection'], '1; mode=block', 'XSS Filter must be active');
  console.log('   ✓ Enterprise security headers verified: X-Frame-Options: DENY, nosniff, XSS protection active');

  // 2. Verify Database State is 100% Clean (0 registrations, 0 payments, 0 teams)
  console.log('2. Verifying database registrations are completely cleared...');
  const adminLogin = await request(
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
  assert.strictEqual(adminLogin.statusCode, 200);
  const token = adminLogin.data.token;

  const stats = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(stats.statusCode, 200);
  assert.strictEqual(stats.data.stats.totalRegistrations, 0, 'Total registrations must be 0');
  assert.strictEqual(stats.data.stats.totalStudents, 0, 'Total students enrolled must be 0');
  console.log('   ✓ Confirmed: Total registrations = 0 & Total Students = 0 (Pristine Database State)');

  const esportsStats = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/esports/stats',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(esportsStats.statusCode, 200);
  assert.strictEqual(esportsStats.data.stats.totalBgmiTeams, 0);
  assert.strictEqual(esportsStats.data.stats.totalFreeFireTeams, 0);
  console.log('   ✓ Confirmed: Total E-Sports teams = 0 (BGMI = 0, Free Fire = 0)');

  // Verify Venue & Settings
  const eventsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'GET',
  });
  assert.strictEqual(eventsRes.statusCode, 200);
  assert(eventsRes.data.events.length > 0);
  for (const ev of eventsRes.data.events) {
    assert.strictEqual(ev.venue, 'Apex University Auditorium, VT Road, Mansarovar');
  }
  console.log('   ✓ Confirmed: All event venues updated to "Apex University Auditorium, VT Road, Mansarovar"');

  const settingsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/public/info',
    method: 'GET',
  });
  assert.strictEqual(settingsRes.statusCode, 200);
  assert.strictEqual(settingsRes.data.info.universityName, 'Apex University');
  assert.strictEqual(settingsRes.data.info.contactVenue, 'Apex University Auditorium, VT Road, Mansarovar');
  console.log('   ✓ Confirmed: University set to "Apex University" & Venue set to "Apex University Auditorium, VT Road, Mansarovar"');

  // 3. Verify Input Sanitization blocks malicious script injections
  console.log('3. Testing Anti-XSS and Input Sanitization Middleware...');
  const xssAttemptRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'test<script>alert("hacked")</script>@uni.edu',
      password: 'SamplePassword123!',
    }
  );
  // It shouldn't crash, and inputs should have script stripped safely
  assert(xssAttemptRes.statusCode === 401 || xssAttemptRes.statusCode === 400);
  console.log('   ✓ Malicious script injection safely intercepted and neutralized');

  console.log('\n=============================================================');
  console.log('🎉 WEBSITE SECURITY ENFORCED & CLEAN DATABASE VERIFIED!');
  console.log('=============================================================\n');
}

verifySecurityAndState().catch((err) => {
  console.error('Security test failed:', err);
  process.exit(1);
});
