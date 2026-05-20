import React from 'react';
import './Badge.css';

type Status = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'LOST';

interface BadgeProps {
  status: Status;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  return (
    <span className={`badge badge-${status.toLowerCase()} ${className}`}>
      {status}
    </span>
  );
};
