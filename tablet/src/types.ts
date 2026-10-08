export interface TabletDonation {
  id: string;
  donorName: string;
  amount: number;
  purpose: string;
  date: string;
  panMasked?: string;
  status: 'verified' | 'pending';
}

export interface TabletCamp {
  id: string;
  name: string;
  location: string;
  coordinator: string;
  mealsServed: number;
  mealsTarget: number;
  status: 'Active' | 'Mobilizing' | 'Completed';
  lastVerifiedAt: string;
}

export interface TabletEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  desc: string;
  category: string;
  volunteersRegistered: number;
  targetVolunteers: number;
}
