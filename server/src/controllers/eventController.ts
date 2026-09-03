import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EventController {
  /**
   * Get all active published events for public and student viewing
   */
  async getAllEvents(_req: Request, res: Response): Promise<void> {
    try {
      const events = await prisma.event.findMany({
        orderBy: [{ day: 'asc' }, { name: 'asc' }],
        include: {
          _count: {
            select: {
              registrations: {
                where: {
                  status: { in: ['APPROVED', 'UNDER_REVIEW', 'PAYMENT_SUBMITTED'] },
                },
              },
            },
          },
        },
      });

      const formatted = events.map((ev) => ({
        ...ev,
        registeredCount: ev._count.registrations,
        isFull: ev.maxParticipants ? ev._count.registrations >= ev.maxParticipants : false,
      }));

      res.status(200).json({ success: true, events: formatted });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch events list.' });
    }
  }

  /**
   * Get event details by slug or id
   */
  async getEventBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const event = await prisma.event.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
        },
        include: {
          _count: {
            select: {
              registrations: {
                where: {
                  status: { in: ['APPROVED', 'UNDER_REVIEW'] },
                },
              },
            },
          },
        },
      });

      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        event: {
          ...event,
          registeredCount: event._count.registrations,
          isFull: event.maxParticipants ? event._count.registrations >= event.maxParticipants : false,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error retrieving event details.' });
    }
  }
}

export const eventController = new EventController();
