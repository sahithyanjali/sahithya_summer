export const ADMIN_API = {
  getStats: async () => {
    const res = await fetch('/api/v1/admin/overview');
    return res.json();
  },
  getVolunteers: async () => {
    const res = await fetch('/api/v1/admin/volunteers');
    return res.json();
  },
  verifyVolunteer: async (volunteerId: string, approved: boolean, notes: string) => {
    const res = await fetch(`/api/v1/admin/volunteers/${volunteerId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idVerified: approved, backgroundCheckStatus: approved ? "CLEARED" : "FLAGGED", notes }),
    });
    return res.json();
  },
  getRegistrations: async (status?: string) => {
    const url = status ? `/api/v1/registrations?status=${status}` : '/api/v1/registrations';
    const res = await fetch(url);
    return res.json();
  },
  updateRegistrationStatus: async (id: string, status: "Approved" | "Rejected", notes?: string) => {
    const res = await fetch(`/api/v1/registrations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },
  getApplications: async (status?: string) => {
    const url = status ? `/api/v1/applications?status=${status}` : '/api/v1/applications';
    const res = await fetch(url);
    return res.json();
  },
  updateApplicationStatus: async (id: string, status: "Approved" | "Rejected", notes?: string) => {
    const res = await fetch(`/api/v1/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },
  getDonations: async () => {
    const res = await fetch('/api/v1/donations');
    return res.json();
  },
  createDonation: async (data: any) => {
    const res = await fetch('/api/v1/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  deleteDonation: async (id: string) => {
    const res = await fetch(`/api/v1/donations/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  purgeDummyData: async () => {
    const res = await fetch('/api/v1/admin/purge-dummy-data', {
      method: 'POST',
    });
    return res.json();
  },
  getOpportunities: async () => {
    const res = await fetch('/api/v1/opportunities');
    return res.json();
  },
  createOpportunity: async (data: any) => {
    const res = await fetch('/api/v1/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  approveOpportunity: async (id: string) => {
    const res = await fetch(`/api/v1/admin/opportunities/${id}/approve`, {
      method: 'POST',
    });
    return res.json();
  },
};
