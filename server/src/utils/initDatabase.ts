import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function ensureDatabaseInitialized() {
  try {
    // 1. Ensure upload directories exist
    const proofsDir = path.join(__dirname, '../../uploads/payment_proofs');
    const qrDir = path.join(__dirname, '../../uploads/qr_codes');
    if (!fs.existsSync(proofsDir)) fs.mkdirSync(proofsDir, { recursive: true });
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    // 2. Ensure Admin User exists
    const adminEmail = process.env.ADMIN_EMAIL || 'parmjeetyadav1230@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Engineeringday@2026';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: 'ADMIN',
          isActive: true,
          mustChangePassword: false,
        },
      });
      console.log(`🛡️ Auto-initialized Administrator account: ${adminEmail}`);
    }

    // 3. Ensure Events exist
    const eventCount = await prisma.event.count();
    if (eventCount === 0) {
      const defaultVenue = 'Apex University Auditorium, VT Road, Mansarovar';
      const events = [
        {
          name: 'E-SPORTS — BGMI',
          slug: 'bgmi',
          description: 'Compete in an exciting BGMI tournament and showcase your gaming skills, teamwork and strategy.',
          category: 'ESPORTS',
          day: 'DAY_1',
          date: '14 September 2026',
          startTime: '10:00 AM',
          endTime: '01:00 PM',
          venue: defaultVenue,
          registrationFee: 49,
          maxParticipants: 100,
          isRegistrationOpen: true,
          requiresPayment: true,
          isTeamEvent: true,
          minTeamSize: 1,
          maxTeamSize: 4,
          rules: '1. Squad registration (1-4 players).\n2. BGMI mobile only.\n3. Match room ID and password shared 15 mins prior.\n4. Decisions of tournament admins are final.',
        },
        {
          name: 'E-SPORTS — FREE FIRE',
          slug: 'free-fire',
          description: 'Battle it out in a competitive Free Fire tournament and prove your gaming skills.',
          category: 'ESPORTS',
          day: 'DAY_1',
          date: '14 September 2026',
          startTime: '02:00 PM',
          endTime: '05:00 PM',
          venue: defaultVenue,
          registrationFee: 49,
          maxParticipants: 100,
          isRegistrationOpen: true,
          requiresPayment: true,
          isTeamEvent: true,
          minTeamSize: 1,
          maxTeamSize: 4,
          rules: '1. Squad registration (1-4 players).\n2. Mobile devices only.\n3. Room credentials shared 15 minutes before match start.\n4. Fair play policy enforced.',
        },
        {
          name: 'BLIND CODING COMPETITION',
          slug: 'blind-coding',
          description: 'Test your programming logic and problem-solving skills under challenging conditions.',
          category: 'TECHNICAL',
          day: 'DAY_1',
          date: '14 September 2026',
          startTime: '11:00 AM',
          endTime: '01:00 PM',
          venue: defaultVenue,
          registrationFee: 49,
          maxParticipants: 60,
          isRegistrationOpen: true,
          requiresPayment: true,
          isTeamEvent: false,
          minTeamSize: 1,
          maxTeamSize: 1,
          rules: '1. Individual participation.\n2. Monitors will be turned off while typing code.\n3. 3 rounds of escalating algorithmic difficulty.',
        },
        {
          name: 'QUIZ COMPETITION',
          slug: 'quiz',
          description: 'Test your knowledge across engineering, technology, science, general awareness and current affairs.',
          category: 'TECHNICAL',
          day: 'DAY_1',
          date: '14 September 2026',
          startTime: '02:30 PM',
          endTime: '04:30 PM',
          venue: defaultVenue,
          registrationFee: 49,
          maxParticipants: 80,
          isRegistrationOpen: true,
          requiresPayment: true,
          isTeamEvent: false,
          minTeamSize: 1,
          maxTeamSize: 1,
          rules: '1. Written buzzer and rapid-fire rounds.\n2. Covers core engineering, tech history, and current innovations.',
        },
        {
          name: 'CULTURAL PERFORMANCE',
          slug: 'cultural-performance',
          description: 'A platform for students to showcase their singing, dancing, performing and creative talents.',
          category: 'CULTURAL',
          day: 'DAY_2',
          date: '15 September 2026',
          startTime: '10:00 AM',
          endTime: '01:30 PM',
          venue: defaultVenue,
          registrationFee: 0,
          maxParticipants: 150,
          isRegistrationOpen: true,
          requiresPayment: false,
          isTeamEvent: false,
          minTeamSize: 1,
          maxTeamSize: 6,
          rules: '1. Solo or group performance allowed.\n2. Time limit: Maximum 4 minutes per act.',
        },
        {
          name: 'PRIZE DISTRIBUTION',
          slug: 'prize-distribution',
          description: "Recognizing winners and celebrating excellence achieved during Engineer's Day 2026.",
          category: 'CEREMONY',
          day: 'DAY_2',
          date: '15 September 2026',
          startTime: '03:00 PM',
          endTime: '05:30 PM',
          venue: defaultVenue,
          registrationFee: 0,
          maxParticipants: null,
          isRegistrationOpen: false,
          requiresPayment: false,
          isTeamEvent: false,
          minTeamSize: 1,
          maxTeamSize: 1,
          rules: '1. Open to all students, faculty, and participants.\n2. Trophy, medal, and certificate distribution.',
        },
      ];

      for (const ev of events) {
        await prisma.event.create({ data: ev });
      }
      console.log(`📅 Auto-seeded 6 standard competition events`);
    }

    // 4. Ensure System Settings exist
    const settingsCount = await prisma.systemSetting.count();
    if (settingsCount === 0) {
      const defaultSettings = [
        { key: 'university_name', value: 'Apex University', description: 'Host University' },
        { key: 'contact_email', value: 'parmjeetyadav1230@gmail.com', description: 'Admin Email' },
        { key: 'contact_phone', value: '+91 94678 43851', description: 'Coordinator Contact' },
        { key: 'contact_venue', value: 'Apex University Auditorium, VT Road, Mansarovar', description: 'Event Location' },
        { key: 'default_upi_id', value: 'engineeringday2026@upi', description: 'Default UPI ID' },
        { key: 'default_upi_name', value: "Apex Engineer's Day 2026", description: 'Default UPI Name' },
      ];
      for (const s of defaultSettings) {
        await prisma.systemSetting.create({ data: s });
      }
      console.log(`⚙️ Auto-seeded core system settings`);
    }
  } catch (err) {
    console.error('⚠️ Database auto-initialization note:', err);
  }
}
