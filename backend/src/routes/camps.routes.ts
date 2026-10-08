import { Router } from 'express';
import { mockReliefCamps } from '../db/mockDb.js';

export const campsRouter = Router();

// GET all active relief camps
campsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    count: mockReliefCamps.length,
    camps: mockReliefCamps
  });
});

// POST update meals served at a camp
campsRouter.post('/meal-update', (req, res) => {
  const { campId, additionalMeals } = req.body;
  const camp = mockReliefCamps.find(c => c.id === campId);
  if (!camp) {
    return res.status(404).json({ success: false, error: 'Camp not found' });
  }

  const added = Number(additionalMeals) || 50;
  camp.mealsServed += added;
  camp.lastVerifiedAt = 'Just now';

  res.json({
    success: true,
    message: `Recorded ${added} meals served at ${camp.name}`,
    camp
  });
});
