import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  isDeleting: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};
