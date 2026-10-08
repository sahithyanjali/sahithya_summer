import { Router } from 'express';
import { mockEvents } from '../db/mockDb.js';

export const eventsRouter = Router();

// GET all active civic drives
eventsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    count: mockEvents.length,
    events: mockEvents
  });
});

// POST register RSVP for an event
eventsRouter.post('/rsvp', (req, res) => {
  const { eventId, volunteerName, phone } = req.body;
  const event = mockEvents.find(e => e.id === eventId);
  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }

  event.volunteersRegistered += 1;

  res.json({
    success: true,
    message: `Registered ${volunteerName || 'Volunteer'} for ${event.title}`,
    event
  });
});
