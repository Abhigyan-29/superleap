import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Lock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Lead } from '../../api/leads';
import { type Status, isLocked, getValidNextStatuses } from '../../utils/statusRules';
import { Badge } from '../../components/Badge';

interface BoardColumnProps {
  status: Status;
  leads: Lead[];
  activeLead?: Lead | null;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ status, leads, activeLead }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const isValidDropTarget = activeLead ? (getValidNextStatuses(activeLead.status).includes(status) || activeLead.status === status) : false;
  const isInvalidDropTarget = activeLead ? !isValidDropTarget : false;

  let columnClass = `board-column column-${status.toLowerCase()}`;
  if (isOver && isValidDropTarget) columnClass += ' column-over-valid';
  else if (isOver && isInvalidDropTarget) columnClass += ' column-over-invalid';
  else if (activeLead && isValidDropTarget) columnClass += ' column-valid-target';
  else if (activeLead && isInvalidDropTarget) columnClass += ' column-invalid-target';

  return (
    <div 
      className={columnClass}
    >
      <div className="board-column-header">
        <span>{status} {isLocked(status) && <Lock size={14} style={{ display: 'inline', marginLeft: '4px' }} />}</span>
        <span className="board-column-count">{leads.length}</span>
      </div>
      <div className="board-column-content" ref={setNodeRef}>
        {leads.map(lead => (
          <BoardCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  );
};

interface BoardCardProps {
  lead: Lead;
  isOverlay?: boolean;
}

export const BoardCard: React.FC<BoardCardProps> = ({ lead, isOverlay }) => {
  const locked = isLocked(lead.status);
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    disabled: locked, // Cannot drag locked leads
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        opacity: isDragging ? 0.5 : 1,
        cursor: locked ? 'not-allowed' : (isDragging ? 'grabbing' : 'grab'),
        boxShadow: isOverlay ? 'var(--shadow-floating)' : undefined,
      }}
      {...listeners}
      {...attributes}
      className="board-card"
    >
      {locked && <Lock size={16} className="locked-overlay" />}
      <div className="card-name" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {lead.name}
        <button className="btn-ghost" style={{ padding: '4px', borderRadius: '4px' }} onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}>
          <Eye size={14} />
        </button>
      </div>
      <div className="card-email">{lead.email}</div>
      <div className="card-footer">
        <Badge status={lead.status} />
        <span>{new Date(lead.updated_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
};
