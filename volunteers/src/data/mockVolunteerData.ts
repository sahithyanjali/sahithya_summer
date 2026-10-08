import { VolunteerProfile, SevaShift, AttendanceRecord, SevaCertificate } from '../types';

export const CURRENT_VOLUNTEER: VolunteerProfile = {
  id: 'VOL-2026-904',
  fullName: 'Anjali Sharma',
  phone: '+91 98765 43210',
  email: 'anjali.sharma@sevasphoorthi.org',
  city: 'Bengaluru (Karnataka)',
  bloodGroup: 'O+ Positive',
  clearanceLevel: 'Level 2: Camp Coordinator',
  badgeNumber: 'SST-BLR-0482',
  totalHours: 148,
  completedMissions: 24,
  emergencyContact: {
    name: 'Ramesh Sharma',
    phone: '+91 98765 11223',
    relationship: 'Father'
  },
  skills: [
    'Emergency First Aid & CPR',
    'Annadana Food Handling',
    'Crowd Safety Management',
    'Pediatric Literacy Teaching',
    'Kannada-English Translation'
  ],
  joinedDate: '12 January 2024',
  status: 'ACTIVE',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400',
  qrCodeSignature: 'SHA256:88a7c290ef41289a01bfca90123ef'
};

export const INITIAL_SHIFTS: SevaShift[] = [
  {
    id: 'SHIFT-201',
    title: 'Nelamangala Highway Annadana Food Distribution',
    category: 'Annadana',
    location: 'NH48 Junction, Nelamangala Rural',
    date: 'Saturday, 26 Sep 2026',
    timeSlot: '09:00 AM - 02:00 PM (5 Hours)',
    reportingVenue: 'Sphoorthi Base Tent #2, Beside Highway Toll',
    coordinatorName: 'Rajesh Gowda',
    coordinatorPhone: '+91 98450 11223',
    slotsFilled: 14,
    slotsTotal: 20,
    requiredSkills: ['Annadana Food Handling', 'Crowd Safety Management'],
    pointsAwarded: 50,
    isClaimedByUser: true
  },
  {
    id: 'SHIFT-202',
    title: 'Mega Blood Donation Drive Pediatric ICU Camp',
    category: 'Medical Camp',
    location: 'Central Town Hall, Bengaluru',
    date: 'Sunday, 27 Sep 2026',
    timeSlot: '07:30 AM - 01:30 PM (6 Hours)',
    reportingVenue: 'Town Hall South Wing Registration Desk',
    coordinatorName: 'Dr. Ramesh K',
    coordinatorPhone: '+91 98450 99881',
    slotsFilled: 22,
    slotsTotal: 30,
    requiredSkills: ['Emergency First Aid & CPR', 'Donor Registration'],
    pointsAwarded: 60,
    isClaimedByUser: false
  },
  {
    id: 'SHIFT-203',
    title: 'Vidya Rural Primary School Kit & Solar Lamp Handover',
    category: 'Vidya Education',
    location: 'Govt Higher Primary School, Chintamani',
    date: 'Wednesday, 30 Sep 2026',
    timeSlot: '10:00 AM - 03:00 PM (5 Hours)',
    reportingVenue: 'School Main Assembly Quadrangle',
    coordinatorName: 'Priyanka Sharma',
    coordinatorPhone: '+91 98450 56789',
    slotsFilled: 10,
    slotsTotal: 15,
    requiredSkills: ['Pediatric Literacy Teaching', 'Kannada-English Translation'],
    pointsAwarded: 50,
    isClaimedByUser: false
  },
  {
    id: 'SHIFT-204',
    title: 'Ghati Subramanya Pilgrim Water & Seva Helpdesk',
    category: 'Annadana',
    location: 'Temple Valley, Doddaballapura',
    date: 'Sunday, 04 Oct 2026',
    timeSlot: '06:00 AM - 12:00 PM (6 Hours)',
    reportingVenue: 'Pilgrim Queue Complex Gate 4',
    coordinatorName: 'Suresh Kumar',
    coordinatorPhone: '+91 98450 44556',
    slotsFilled: 18,
    slotsTotal: 25,
    requiredSkills: ['Crowd Safety Management'],
    pointsAwarded: 60,
    isClaimedByUser: false
  }
];

export const MOCK_ATTENDANCE_LOGS: AttendanceRecord[] = [
  {
    id: 'LOG-8801',
    shiftTitle: 'Annadana Hot Meal Prep & Dispatch',
    location: 'Nelamangala Highway Shelter',
    date: '20 Sep 2026',
    checkInTime: '08:55 AM',
    checkOutTime: '02:05 PM',
    hoursEarned: 5.2,
    verifiedBy: 'Rajesh Gowda (Camp Head)',
    blockHash: '0x8f2a9910ba1248c01',
    status: 'VERIFIED'
  },
  {
    id: 'LOG-8802',
    shiftTitle: 'Vidya Study Kit Assembly & Packaging',
    location: 'Central Seva Warehouse, Bengaluru',
    date: '13 Sep 2026',
    checkInTime: '10:00 AM',
    checkOutTime: '03:30 PM',
    hoursEarned: 5.5,
    verifiedBy: 'Priyanka Sharma',
    blockHash: '0x33bca01992144ef11',
    status: 'VERIFIED'
  },
  {
    id: 'LOG-8803',
    shiftTitle: 'Rural Health Screening Camp Support',
    location: 'Kolar Drought Relief Supply Hub',
    date: '06 Sep 2026',
    checkInTime: '07:45 AM',
    checkOutTime: '02:15 PM',
    hoursEarned: 6.5,
    verifiedBy: 'Manjula Devi',
    blockHash: '0x55fed102450891ca9',
    status: 'VERIFIED'
  }
];

export const INITIAL_CERTIFICATE: SevaCertificate = {
  certificateId: 'SST-CERT-2026-00482',
  recipientName: 'Anjali Sharma',
  volunteerId: 'VOL-2026-904',
  serviceHours: 148,
  initiatives: [
    'Rural Annadana Relief (1,250+ meals distributed)',
    'Pediatric Emergency Blood Camps (3 units verified)',
    'Vidya Rural Education Program (45 kits disbursed)'
  ],
  issuedOn: '21 September 2026',
  trustRegNo: 'Public Charitable Trust Reg. No. 402/2021',
  verifiedHash: '0x88a7c290ef41289a01bfca90123efd9021a88b10',
  signatureAuthority: 'Trustee Board • Sphoorthi Seva Trust'
};
