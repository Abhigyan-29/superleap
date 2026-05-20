export type Status = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

export const STATUS_OPTIONS: Status[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

const VALID_TRANSITIONS: Record<Status, Status[]> = {
  NEW: ['CONTACTED', 'LOST'],
  CONTACTED: ['QUALIFIED', 'LOST'],
  QUALIFIED: ['CONVERTED', 'LOST'],
  CONVERTED: [], // Locked
  LOST: [],      // Locked
};

export const getValidNextStatuses = (currentStatus: Status): Status[] => {
  return VALID_TRANSITIONS[currentStatus] || [];
};

export const isValidTransition = (currentStatus: Status, targetStatus: Status): boolean => {
  if (currentStatus === targetStatus) return true; // Moving to same status is allowed (no-op)
  return VALID_TRANSITIONS[currentStatus].includes(targetStatus);
};

export const isLocked = (status: Status): boolean => {
  return status === 'CONVERTED' || status === 'LOST';
};
