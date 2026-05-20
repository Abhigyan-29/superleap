import React, { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { DndContext, useSensor, useSensors, PointerSensor, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { Lock } from 'lucide-react';

import { leadsApi, type Lead } from '../api/leads';
import { type Status, STATUS_OPTIONS, getValidNextStatuses, isLocked } from '../utils/statusRules';
import { useToast } from '../components/Toast';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { BoardColumn, BoardCard } from './components/BoardColumn';

import './LeadsBoard.css';

export const LeadsBoard: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State
  const searchStr = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || '';

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: leadsApi.getLeads,
  });

  const updateMutation = useMutation({
    mutationFn: leadsApi.updateLead,
    onMutate: async ({ id, data }) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['leads'] });
      const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
      
      queryClient.setQueryData<Lead[]>(['leads'], (old) => {
        if (!old) return [];
        return old.map(l => l.id === id ? { ...l, ...data } : l);
      });

      return { previousLeads };
    },
    onError: (err, newLead, context) => {
      queryClient.setQueryData(['leads'], context?.previousLeads);
      addToast('Failed to change status', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.name.toLowerCase().includes(searchStr.toLowerCase()) || 
                            lead.email.toLowerCase().includes(searchStr.toLowerCase());
      const matchesStatus = statusFilter ? lead.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchStr, statusFilter]);

  // Group by status
  const leadsByStatus = useMemo(() => {
    const acc: Record<Status, Lead[]> = {
      NEW: [], CONTACTED: [], QUALIFIED: [], CONVERTED: [], LOST: []
    };
    filteredLeads.forEach(lead => {
      if (acc[lead.status]) {
        acc[lead.status].push(lead);
      }
    });
    // Sort within columns by date desc and limit to 100 items per column for performance
    for (const key of Object.keys(acc)) {
      acc[key as Status].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      acc[key as Status] = acc[key as Status].slice(0, 100);
    }
    return acc;
  }, [filteredLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Need to drag 8px to activate, allows clicking
      },
    })
  );

  const [activeLead, setActiveLead] = React.useState<Lead | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find(l => l.id === active.id);
    if (lead) setActiveLead(lead);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveLead(null);
    const { active, over } = event;
    
    if (!over) return; // Dropped outside
    
    const leadId = active.id as string;
    const newStatus = over.id as Status;
    const lead = leads.find(l => l.id === leadId);

    if (!lead) return;
    if (lead.status === newStatus) return; // No change

    // Validation
    if (isLocked(lead.status)) {
      addToast('This lead is locked and cannot be moved.', 'error');
      return;
    }

    const validNext = getValidNextStatuses(lead.status);
    if (!validNext.includes(newStatus)) {
      addToast(`Invalid transition from ${lead.status} to ${newStatus}.`, 'error');
      return;
    }

    // Trigger Optimistic Update
    updateMutation.mutate({ id: leadId, data: { status: newStatus } });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams(prev => {
      if (e.target.value) prev.set('q', e.target.value);
      else prev.delete('q');
      return prev;
    }, { replace: true });
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams(prev => {
      if (e.target.value) prev.set('status', e.target.value);
      else prev.delete('status');
      return prev;
    }, { replace: true });
  };

  if (isLoading) return <div className="page-wrapper container flex-center">Loading board...</div>;

  return (
    <div className="page-wrapper container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="board-page-header">
        <div>
          <h1 className="page-title">Boards</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Drag and drop leads to update their status
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Input 
            placeholder="Search leads..." 
            value={searchStr} 
            onChange={handleSearch}
          />
          <Select 
            value={statusFilter} 
            onChange={handleStatusFilter}
            options={[
              { value: '', label: 'All Statuses' },
              ...STATUS_OPTIONS.map(s => ({ value: s, label: s }))
            ]}
          />
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="board-container">
          {STATUS_OPTIONS.map(status => (
            <BoardColumn 
              key={status} 
              status={status} 
              leads={leadsByStatus[status]}
              activeLead={activeLead}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <BoardCard lead={activeLead} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
