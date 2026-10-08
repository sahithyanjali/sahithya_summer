import { 
  DonationEntity, 
  ReliefCampEntity, 
  EventFeedEntity, 
  AuditRecordEntity, 
  VolunteerProfileEntity 
} from '../models/types.js';

export const mockDonations: DonationEntity[] = [
  {
    id: 'SEVA-2026-901',
    donorName: 'Dr. Ramesh K',
    amount: 5000,
    purpose: 'Rural Mobile Clinic Medicine',
    date: '21 Sep 2026, 09:30 AM',
    panMasked: 'ABCDE****F',
    transactionRef: 'UPI-ICICI-8921890',
    receiptNumber: '80G-2026-0901',
    status: 'VERIFIED',
    is80GEligible: true,
    blockHash: '0x8f2a71d8e12489cbe3412019ab7612ef'
  },
  {
    id: 'SEVA-2026-902',
    donorName: 'Sneha Sundaram',
    amount: 2500,
    purpose: 'Vidya Student Education Kits',
    date: '21 Sep 2026, 08:45 AM',
    panMasked: 'BKLPQ****R',
    transactionRef: 'UPI-HDFC-3329011',
    receiptNumber: '80G-2026-0902',
    status: 'VERIFIED',
    is80GEligible: true,
    blockHash: '0x3c99021aef45601289df712890ac3319'
  },
  {
    id: 'SEVA-2026-903',
    donorName: 'Ananya Hegde',
    amount: 1500,
    purpose: 'Annadana 100 Hot Meals',
    date: '20 Sep 2026',
    panMasked: 'AAAPZ****K',
    transactionRef: 'UPI-SBI-7782109',
    receiptNumber: '80G-2026-0903',
    status: 'VERIFIED',
    is80GEligible: true,
    blockHash: '0x12a90fb33901caee7890123efd9018ca'
  },
  {
    id: 'SEVA-2026-904',
    donorName: 'Venkatesh Rao',
    amount: 10000,
    purpose: 'Disaster Relief Grain Kits',
    date: '20 Sep 2026',
    panMasked: 'CGHJK****M',
    transactionRef: 'UPI-AXIS-9921044',
    receiptNumber: '80G-2026-0904',
    status: 'VERIFIED',
    is80GEligible: true,
    blockHash: '0x99eeb023190abfde6628901caa781290'
  },
  {
    id: 'SEVA-2026-905',
    donorName: 'Kavitha Murthy',
    amount: 1000,
    purpose: 'Midday Nutrition Program',
    date: '19 Sep 2026',
    panMasked: 'ZZZPK****Q',
    transactionRef: 'UPI-PAYTM-4410982',
    receiptNumber: '80G-2026-0905',
    status: 'VERIFIED',
    is80GEligible: true,
    blockHash: '0x4488921cfade3910bba9012876ef9021'
  }
];

export const mockReliefCamps: ReliefCampEntity[] = [
  {
    id: 'CAMP-01',
    name: 'Nelamangala Highway Annadana Shelter',
    location: 'NH48 Junction, Nelamangala Rural',
    coordinator: 'Rajesh Gowda',
    coordinatorPhone: '+91 98450 11223',
    mealsServed: 1250,
    mealsTarget: 1500,
    status: 'Active',
    lastVerifiedAt: '10 mins ago',
    auditPhotosCount: 14
  },
  {
    id: 'CAMP-02',
    name: 'Ghati Subramanya Pilgrim Seva Camp',
    location: 'Temple Valley, Doddaballapura',
    coordinator: 'Suresh Kumar',
    coordinatorPhone: '+91 98450 44556',
    mealsServed: 2100,
    mealsTarget: 2500,
    status: 'Active',
    lastVerifiedAt: '25 mins ago',
    auditPhotosCount: 28
  },
  {
    id: 'CAMP-03',
    name: 'Kolar Drought Relief Supply Hub',
    location: 'Malur Industrial Bypass, Kolar',
    coordinator: 'Manjula Devi',
    coordinatorPhone: '+91 98450 77889',
    mealsServed: 850,
    mealsTarget: 1000,
    status: 'Active',
    lastVerifiedAt: '1 hour ago',
    auditPhotosCount: 19
  }
];

export const mockEvents: EventFeedEntity[] = [
  {
    id: 'EV-01',
    title: 'Sphoorthi Mega Blood Donation Drive',
    date: '15 Oct 2026',
    time: '08:00 AM - 04:00 PM',
    location: 'Central Town Hall, Bengaluru',
    desc: 'Targeting 500 units of rare blood types for government pediatric ICUs.',
    img: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=600',
    category: 'Healthcare',
    volunteersRegistered: 42,
    targetVolunteers: 60
  },
  {
    id: 'EV-02',
    title: 'Vidya Rural School Kit Distribution',
    date: '22 Oct 2026',
    time: '10:00 AM - 02:00 PM',
    location: 'Govt Higher Primary School, Chintamani',
    desc: 'Distributing school bags, notebooks, and solar study lamps to 450 underprivileged students.',
    img: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600',
    category: 'Education',
    volunteersRegistered: 28,
    targetVolunteers: 35
  }
];

export const mockAuditLedger: AuditRecordEntity[] = [
  {
    blockIndex: 1042,
    timestamp: '2026-09-21T09:30:00Z',
    recordType: 'DONATION',
    referenceId: 'SEVA-2026-901',
    beneficiarySummary: 'Purchased 20 boxes of essential pediatric antibiotics & saline for rural camps',
    amountOrUnits: 5000,
    prevBlockHash: '0x12e89fa9012876bcdef',
    blockHash: '0x8f2a71d8e12489cbe3412019ab7612ef'
  },
  {
    blockIndex: 1041,
    timestamp: '2026-09-21T07:15:00Z',
    recordType: 'MEAL_DISTRIBUTION',
    referenceId: 'CAMP-01',
    beneficiarySummary: 'Batch #408 cooked & distributed at Nelamangala Highway Annadana Shelter',
    amountOrUnits: 350,
    prevBlockHash: '0x77cba091823901bca90',
    blockHash: '0x12e89fa9012876bcdef'
  }
];
