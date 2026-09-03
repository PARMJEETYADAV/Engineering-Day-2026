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

async function testAdminEventCRUD() {
  console.log('🧪 Testing Admin Event Add, Edit & Delete Capabilities with Date & Time...\n');

  // 1. Admin Login
  console.log('1. Authenticating Admin...');
  const loginRes = await request(
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
  assert.strictEqual(loginRes.statusCode, 200);
  const token = loginRes.data.token;
  console.log('   ✓ Admin authenticated successfully');

  // 2. Create Event with Date & Time
  console.log('2. Creating a new competition event with Date & Time via POST /api/admin/events...');
  const createRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/events',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      name: 'LINE FOLLOWER ROBOTICS CHALLENGE',
      category: 'TECHNICAL',
      day: 'DAY_2',
      date: '15 September 2026',
      startTime: '11:30 AM',
      endTime: '02:00 PM',
      venue: 'Apex University Auditorium, VT Road, Mansarovar',
      registrationFee: 0,
      maxParticipants: 60,
      isRegistrationOpen: true,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 4,
      description: 'Design and calibrate an autonomous robot to navigate intricate tracks in minimum time.',
      rules: '1. Autonomous robots only.\n2. Maximum robot dimensions 25x25cm.\n3. Track penalties apply for line deviations.',
    }
  );

  assert.strictEqual(createRes.statusCode, 201);
  assert(createRes.data.event);
  const createdEvent = createRes.data.event;
  assert.strictEqual(createdEvent.name, 'LINE FOLLOWER ROBOTICS CHALLENGE');
  assert.strictEqual(createdEvent.date, '15 September 2026');
  assert.strictEqual(createdEvent.startTime, '11:30 AM');
  assert.strictEqual(createdEvent.endTime, '02:00 PM');
  assert.strictEqual(createdEvent.registrationFee, 0);
  console.log(`   ✓ Event created: "${createdEvent.name}" (ID: ${createdEvent.id}) on ${createdEvent.date} from ${createdEvent.startTime} to ${createdEvent.endTime}`);

  // 3. Verify in Public Event Catalog
  console.log('3. Verifying the created event appears in public catalog...');
  const publicEventsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'GET',
  });
  assert.strictEqual(publicEventsRes.statusCode, 200);
  const found = publicEventsRes.data.events.find((e: any) => e.id === createdEvent.id);
  assert(found, 'Created event must be found in public event catalog');
  assert.strictEqual(found.startTime, '11:30 AM');
  assert.strictEqual(found.endTime, '02:00 PM');
  console.log('   ✓ Verified event present in public catalog');

  // 4. Update Event Date & Time via PATCH /api/admin/events/:id
  console.log('4. Updating event date & time via PATCH /api/admin/events/:id...');
  const updateRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/admin/events/${createdEvent.id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      startTime: '12:00 PM',
      endTime: '02:30 PM',
      registrationFee: 49,
    }
  );
  assert.strictEqual(updateRes.statusCode, 200);
  assert.strictEqual(updateRes.data.event.startTime, '12:00 PM');
  assert.strictEqual(updateRes.data.event.registrationFee, 49);
  console.log('   ✓ Event updated: New time 12:00 PM - 02:30 PM, fee ₹49');

  // 5. Delete Event via DELETE /api/admin/events/:id
  console.log('5. Deleting event via DELETE /api/admin/events/:id...');
  const deleteRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/events/${createdEvent.id}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(deleteRes.statusCode, 200);
  console.log('   ✓ Event deleted successfully from database');

  // 6. Confirm Deletion
  const verifyDeletedRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/events',
    method: 'GET',
  });
  const shouldBeMissing = verifyDeletedRes.data.events.find((e: any) => e.id === createdEvent.id);
  assert(!shouldBeMissing, 'Deleted event must no longer exist in catalog');
  console.log('   ✓ Confirmed: Deleted event completely removed');

  console.log('\n============================================================');
  console.log('🎉 ALL ADMIN EVENT MANAGEMENT CAPABILITIES VERIFIED 100%!');
  console.log('============================================================\n');
}

testAdminEventCRUD().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
