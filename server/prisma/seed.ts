import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Engineering Day 2026...');

  // 1. Admin Account Seed
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@engineeringday2026.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass#2026!';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      mustChangePassword: true,
    },
  });
  console.log(`✓ Admin account initialized: ${adminUser.email}`);

  // 2. Events Seed (Day 1: 14 Sep, Day 2: 15 Sep)
  // NO DJ Celebration anywhere!
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
      venue: 'E-Sports Arena / Lab 4',
      registrationFee: 49,
      maxParticipants: 100,
      isRegistrationOpen: true,
      requiresPayment: true,
      isTeamEvent: true,
      minTeamSize: 4,
      maxTeamSize: 4,
      rules: '1. Squad matches in Erangel and Miramar.\n2. All players must have the official BGMI app updated.\n3. Third-party tools, emulators, or game modifications result in permanent disqualification.\n4. Custom room credentials will be provided 15 minutes before the match.\n5. Official scoring: 1 point per kill + placement points.',
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
      venue: 'E-Sports Arena / Lab 4',
      registrationFee: 49,
      maxParticipants: 100,
      isRegistrationOpen: true,
      requiresPayment: true,
      isTeamEvent: true,
      minTeamSize: 4,
      maxTeamSize: 4,
      rules: '1. Classic Battle Royale Squad format.\n2. Mobile devices only; emulators are barred.\n3. Disconnects due to personal network issues cannot be replayed.\n4. Points allocated for survival ranking and elimination count.\n5. Organizers hold final authority regarding disputes.',
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
      venue: 'Computer Center Block B',
      registrationFee: 49,
      maxParticipants: 80,
      isRegistrationOpen: true,
      requiresPayment: true,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      rules: '1. Individual solo competition.\n2. Participants will code with monitors powered OFF.\n3. Supported languages: C, C++, Java, and Python.\n4. Scoring evaluates syntax accuracy, logical soundness, and successful test-case execution.\n5. Any keyboard shortcut to wake the screen results in forfeiture.',
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
      venue: 'Seminar Hall 1',
      registrationFee: 49, // Configurable in admin panel
      maxParticipants: 120,
      isRegistrationOpen: true,
      requiresPayment: true,
      isTeamEvent: true,
      minTeamSize: 2,
      maxTeamSize: 2,
      rules: '1. Teams of 2 members.\n2. Round 1: Objective multiple-choice technical round.\n3. Round 2: Visual tech puzzle and milestone discovery round.\n4. Round 3: Rapid buzzer round on breakthrough engineering innovations.\n5. Phones and digital smart devices are strictly prohibited.',
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
      venue: 'University Main Auditorium',
      registrationFee: 0, // Configurable in admin panel
      maxParticipants: 50,
      isRegistrationOpen: true,
      requiresPayment: false,
      isTeamEvent: true,
      minTeamSize: 1,
      maxTeamSize: 10,
      rules: '1. Open for Solo and Group performances (Dance, Music, Drama, Stand-up).\n2. Time slot strictly capped at 5 minutes per act.\n3. Audio track / props must be submitted to coordinators before 14th Sep 5:00 PM.\n4. Obscene or inappropriate performances will be stopped immediately.\n5. Judgment based on stage presence, rhythm, artistry, and synchronization.',
    },
    {
      name: 'PRIZE DISTRIBUTION',
      slug: 'prize-distribution',
      description: 'Recognizing winners and celebrating excellence achieved during Engineering Day.',
      category: 'CEREMONY',
      day: 'DAY_2',
      date: '15 September 2026',
      startTime: '03:00 PM',
      endTime: '05:30 PM',
      venue: 'University Main Auditorium',
      registrationFee: 0,
      maxParticipants: null,
      isRegistrationOpen: false, // Non-registerable ceremony
      requiresPayment: false,
      isTeamEvent: false,
      minTeamSize: 1,
      maxTeamSize: 1,
      rules: 'Official grand valedictory ceremony and felicitation. Trophies, cash awards, and certificates presented to all competition winners. Open to all students, faculty, and guests.',
    },
  ];

  for (const ev of events) {
    await prisma.event.upsert({
      where: { slug: ev.slug },
      update: ev,
      create: ev,
    });
    console.log(`✓ Event configured: ${ev.name}`);
  }

  // 3. System Settings Seed
  // Default QR code check
  const qrDefaultFile = '/uploads/qr_codes/default_qr.jpeg';

  const defaultSettings = [
    { key: 'payment_upi_id', value: process.env.DEFAULT_UPI_ID || 'engineeringday2026@upi' },
    { key: 'payment_account_name', value: process.env.DEFAULT_UPI_NAME || 'Engineering Day 2026 Organizers' },
    { key: 'payment_qr_code', value: qrDefaultFile },
    {
      key: 'payment_instructions',
      value: '1. Scan the QR code using Google Pay, PhonePe, Paytm, or any UPI app.\n2. Enter the exact event registration amount.\n3. Take a screenshot of the completed transaction with the UTR clearly visible.\n4. Enter the 12-digit UTR/Transaction ID and upload the screenshot below.\n5. Submit for admin verification.',
    },
    { key: 'university_name', value: 'Apex University' },
    { key: 'event_dates', value: '14th & 15th September 2026' },
    { key: 'registration_id_prefix', value: 'ENG26' },
    { key: 'contact_email', value: 'parmjeetyadav1230@gmail.com' },
    { key: 'contact_phone', value: '+91 94678 43851 / +91 75418 41303' },
    { key: 'coordinator_parmjeet', value: process.env.COORDINATOR_PARMJEET || 'Parmjeet Yadav : 9467843851' },
    { key: 'coordinator_priyanshu', value: process.env.COORDINATOR_PRIYANSHU || 'Priyanshu Sharma : 7541841303' },
    { key: 'contact_venue', value: 'Apex University Auditorium, VT Road, Mansarovar' },
    {
      key: 'required_registration_fields',
      value: JSON.stringify({
        enrollmentNumber: false,
        department: true,
        college: false,
      }),
    },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✓ System settings initialized.');

  // 4. Seed FAQs
  const faqs = [
    {
      question: 'How do I register for Engineering Day 2026?',
      answer: 'Create a student account with your name, email, mobile number, course, and semester. Once logged in, choose your desired event(s), pay via the provided UPI QR code, and submit your payment screenshot along with the UTR number.',
      category: 'REGISTRATION',
      order: 1,
    },
    {
      question: 'What is the registration fee for E-Sports (BGMI and Free Fire)?',
      answer: 'The registration fee is ₹49 per participant/team slot as specified in the event configuration.',
      category: 'EVENTS',
      order: 2,
    },
    {
      question: 'What is the fee for the Blind Coding Competition?',
      answer: 'The fee for Blind Coding is ₹49 per participant.',
      category: 'EVENTS',
      order: 3,
    },
    {
      question: 'How do I make the payment?',
      answer: 'Scan the official UPI QR code displayed on the payment step using any UPI application (GPay, PhonePe, Paytm, BHIM, etc.). Transfer the fee and copy the 12-digit UTR / Transaction ID.',
      category: 'PAYMENT',
      order: 4,
    },
    {
      question: 'Where do I upload the payment screenshot?',
      answer: 'After selecting your event, proceed to the payment page where you can upload the image (JPG, PNG, WEBP up to 5MB) and type in the UTR number.',
      category: 'PAYMENT',
      order: 5,
    },
    {
      question: 'How long does payment verification take?',
      answer: 'Our university event administration team manually audits submissions within 2 to 6 hours. You will receive an in-app confirmation and can view the verified status in your Student Dashboard.',
      category: 'PAYMENT',
      order: 6,
    },
    {
      question: 'Can I register for multiple events?',
      answer: 'Yes! You can register for multiple events (e.g., BGMI + Blind Coding + Quiz). Each event has a separate registration ID and payment record. However, duplicate registrations for the same event are restricted.',
      category: 'REGISTRATION',
      order: 7,
    },
    {
      question: 'What happens if my payment is rejected?',
      answer: 'If the admin identifies an invalid transaction ID or mismatched receipt, the reason will be clearly displayed on your dashboard, and you will have an immediate option to re-upload the correct payment proof.',
      category: 'PAYMENT',
      order: 8,
    },
    {
      question: 'Can I get a physical confirmation card?',
      answer: 'Yes! Once your registration is approved by the admin, your Student Dashboard unlocks a high-resolution, printable official event confirmation pass with a verification badge.',
      category: 'GENERAL',
      order: 9,
    },
    {
      question: 'How do I contact the organizers if I face an issue?',
      answer: 'You can visit the Contact/Help page on this portal or email engday2026@university.edu or call the student coordinator helpline listed on the portal.',
      category: 'GENERAL',
      order: 10,
    },
  ];

  for (const faq of faqs) {
    const existing = await prisma.faqItem.findFirst({
      where: { question: faq.question },
    });
    if (!existing) {
      await prisma.faqItem.create({ data: faq });
    }
  }
  console.log('✓ Initial FAQs initialized.');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
