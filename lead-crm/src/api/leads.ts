import type { Status } from '../utils/statusRules';

const API_URL = 'http://localhost:3001/leads';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: Status;
  source?: string;
  created_at: string;
  updated_at: string;
}

export type CreateLeadDTO = Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLeadDTO = Partial<CreateLeadDTO>;

export const leadsApi = {
  getLeads: async (): Promise<Lead[]> => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  getLead: async (id: string): Promise<Lead> => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Failed to fetch lead');
    return res.json();
  },

  createLead: async (data: CreateLeadDTO): Promise<Lead> => {
    const now = new Date().toISOString();
    const payload = { ...data, created_at: now, updated_at: now };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create lead');
    return res.json();
  },

  updateLead: async ({ id, data }: { id: string; data: UpdateLeadDTO }): Promise<Lead> => {
    const now = new Date().toISOString();
    const payload = { ...data, updated_at: now };
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update lead');
    return res.json();
  },

  deleteLead: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete lead');
  },
};
