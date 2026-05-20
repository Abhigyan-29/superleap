import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import { STATUS_OPTIONS, type Status, getValidNextStatuses, isLocked } from '../utils/statusRules';
import type { CreateLeadDTO, UpdateLeadDTO } from '../api/leads';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  title: string;
}

export const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSubmit, initialData, title }) => {
  const [formData, setFormData] = useState<Partial<CreateLeadDTO>>({
    name: '',
    email: '',
    phone: '',
    status: 'NEW',
    source: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({ name: '', email: '', phone: '', status: 'NEW', source: '' });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      // Error is handled by the caller (mutation)
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!initialData;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Full Name"
          required
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="e.g. Jane Doe"
        />
        <Input
          label="Email Address"
          type="email"
          required
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          placeholder="jane@example.com"
        />
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 000-0000"
        />
        {isEditing ? (
          <Select
            label="Status"
            value={formData.status || 'NEW'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
            options={[
              { value: initialData.status, label: initialData.status },
              ...getValidNextStatuses(initialData.status).map(s => ({ value: s, label: s }))
            ]}
            disabled={isLocked(initialData.status)}
          />
        ) : (
          <Select
            label="Initial Status"
            value={formData.status || 'NEW'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
            options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
          />
        )}
        <Input
          label="Source"
          value={formData.source || ''}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="e.g. Website, Referral"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
