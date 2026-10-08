import { Router } from 'express';

export const volunteersRouter = Router();

interface VolunteerRecord {
  id: string;
  name: string;
  phone: string;
  city: string;
  interestArea: string;
  availability: string;
  registeredAt: string;
  status: 'PENDING_ORIENTATION' | 'ACTIVE' | 'VERIFIED';
}

const volunteerList: VolunteerRecord[] = [
  {
    id: 'VOL-2026-101',
    name: 'Goutham Raj',
    phone: '+91 98450 12345',
    city: 'Bengaluru',
    interestArea: 'Annadana Food Distribution',
    availability: 'Weekends Only',
    registeredAt: '20 Sep 2026',
    status: 'ACTIVE'
  },
  {
    id: 'VOL-2026-102',
    name: 'Priyanka Sharma',
    phone: '+91 98450 56789',
    city: 'Doddaballapura',
    interestArea: 'Vidya Teaching & Kit Distribution',
    availability: 'Weekdays',
    registeredAt: '19 Sep 2026',
    status: 'VERIFIED'
  }
];

volunteersRouter.get('/', (req, res) => {
  res.json({
    success: true,
    count: volunteerList.length,
    volunteers: volunteerList
  });
});

volunteersRouter.post('/register', (req, res) => {
  const { name, phone, city, interestArea, availability } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, error: 'Name and phone are required' });
  }

  const newVol: VolunteerRecord = {
    id: `VOL-2026-${volunteerList.length + 103}`,
    name: name.trim(),
    phone: phone.trim(),
    city: city || 'Bengaluru',
    interestArea: interestArea || 'General Seva',
    availability: availability || 'Weekends',
    registeredAt: 'Just now',
    status: 'PENDING_ORIENTATION'
  };

  volunteerList.unshift(newVol);

  res.json({
    success: true,
    message: `Volunteer registration successful for ${newVol.name}`,
    volunteer: newVol
  });
});
