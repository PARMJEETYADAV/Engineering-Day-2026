import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get public portal FAQs
router.get('/faqs', async (_req: Request, res: Response) => {
  try {
    const faqs = await prisma.faqItem.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
    });
    res.status(200).json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch FAQs.' });
  }
});

// Get portal public info & stats summary
router.get('/info', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    const configMap: Record<string, string> = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    const [totalRegistrations, eventsCount] = await Promise.all([
      prisma.registration.count({ where: { status: { in: ['APPROVED', 'UNDER_REVIEW'] } } }),
      prisma.event.count(),
    ]);

    res.status(200).json({
      success: true,
      info: {
        universityName: configMap.university_name || 'University Institute of Engineering & Technology',
        eventDates: configMap.event_dates || '14th & 15th September 2026',
        contactEmail: configMap.contact_email || 'engday2026@university.edu',
        contactPhone: configMap.contact_phone || '+91 98765 43210',
        contactVenue: configMap.contact_venue || 'Main Campus Auditorium & Tech Blocks',
        totalRegistrations,
        eventsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch portal information.' });
  }
});

// Notifications for authenticated user
router.get('/notifications', async (req: any, res: Response) => {
  try {
    // If authenticated
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(200).json({ success: true, notifications: [] });
      return;
    }

    // Handled in detail if token valid
    res.status(200).json({ success: true, notifications: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

export default router;
