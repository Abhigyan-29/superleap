import React, { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate, useMatch } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Plus, Trash2, Edit2, ChevronDown, Eye } from 'lucide-react';

import { leadsApi, type Lead } from '../api/leads';
import { type Status, STATUS_OPTIONS, getValidNextStatuses, isLocked } from '../utils/statusRules';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Badge } from '../components/Badge';
import { LeadModal } from '../components/LeadModal';
import { DeleteModal } from '../components/DeleteModal';

import './LeadsList.css';

export const LeadsList: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isNewMatch = useMatch('/leads/new');
  const isEditMatch = useMatch('/leads/:id/edit');

  // URL State
  const searchStr = searchParams.get('q') || '';
  const statusFilter = searchParams.get('status') || '';

  // Local State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingLead, setDeletingLead] = useState<Lead | null>(null);
  
  // Bulk Actions State
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Queries & Mutations
  const { data: leads = [], isLoading, isError } = useQuery({
    queryKey: ['leads'],
    queryFn: leadsApi.getLeads,
  });

  const createMutation = useMutation({
    mutationFn: leadsApi.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      addToast('Lead created successfully', 'success');
    },
    onError: () => addToast('Failed to create lead', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: leadsApi.updateLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      addToast('Lead updated successfully', 'success');
    },
    onError: () => addToast('Failed to update lead', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: leadsApi.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      addToast('Lead deleted successfully', 'success');
      setDeletingLead(null);
    },
    onError: () => addToast('Failed to delete lead', 'error'),
  });

  // Derived Data (Filtering)
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.name.toLowerCase().includes(searchStr.toLowerCase()) || 
                            lead.email.toLowerCase().includes(searchStr.toLowerCase());
      const matchesStatus = statusFilter ? lead.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [leads, searchStr, statusFilter]);

  // Virtualization
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredLeads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56, // row height
    overscan: 10,
  });

  // Handlers
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

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleStatusChange = (lead: Lead, newStatus: Status) => {
    updateMutation.mutate({ id: lead.id, data: { status: newStatus } });
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.size} leads?`)) return;
    setIsBulkDeleting(true);
    let success = 0;
    let failed = 0;
    
    for (const id of selectedIds) {
      try {
        await leadsApi.deleteLead(id);
        success++;
      } catch {
        failed++;
      }
    }
    
    queryClient.invalidateQueries({ queryKey: ['leads'] });
    setSelectedIds(new Set());
    setIsBulkDeleting(false);
    addToast(`Bulk delete: ${success} succeeded, ${failed} failed`, failed > 0 ? 'error' : 'success');
  };

  const handleBulkStatusChange = async (newStatus: Status) => {
    // Validate if transition is valid for ALL selected leads
    const selectedLeads = filteredLeads.filter(l => selectedIds.has(l.id));
    const invalidLeads = selectedLeads.filter(l => {
      if (isLocked(l.status)) return true;
      const validNext = getValidNextStatuses(l.status);
      return !validNext.includes(newStatus) && l.status !== newStatus;
    });

    if (invalidLeads.length > 0) {
      addToast(`Cannot bulk update: ${invalidLeads.length} leads have invalid transitions or are locked.`, 'error');
      return;
    }

    let success = 0;
    let failed = 0;
    for (const lead of selectedLeads) {
      if (lead.status === newStatus) continue;
      try {
        await leadsApi.updateLead({ id: lead.id, data: { status: newStatus } });
        success++;
      } catch {
        failed++;
      }
    }

    queryClient.invalidateQueries({ queryKey: ['leads'] });
    setSelectedIds(new Set());
    addToast(`Bulk update: ${success} succeeded, ${failed} failed`, failed > 0 ? 'error' : 'success');
  };

  if (isError) return <div className="page-wrapper container flex-center">Error loading leads. Please check your connection.</div>;

  return (
    <div className="page-wrapper container">
      <div className="list-page-header">
        <div>
          <h1 className="page-title">Leads Directory</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Manage and track your potential customers
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => navigate('/leads/new')}>
          New Lead
        </Button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <Input 
            placeholder="Search by name or email..." 
            value={searchStr} 
            onChange={handleSearch}
          />
        </div>
        <div>
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

      {selectedIds.size > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-actions-info">
            {selectedIds.size} lead(s) selected
          </div>
          <div className="bulk-actions-buttons">
            <select 
              className="action-select" 
              onChange={(e) => {
                if(e.target.value) {
                  handleBulkStatusChange(e.target.value as Status);
                  e.target.value = '';
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Change Status...</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button variant="danger" size="sm" onClick={handleBulkDelete} isLoading={isBulkDeleting}>
              <Trash2 size={16} /> Bulk Delete
            </Button>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-header-group">
          <div className="table-cell cell-checkbox">
            <input 
              type="checkbox" 
              checked={filteredLeads.length > 0 && selectedIds.size === filteredLeads.length}
              onChange={toggleAll}
            />
          </div>
          <div className="table-cell cell-name">Name</div>
          <div className="table-cell cell-email">Email</div>
          <div className="table-cell cell-status">Status</div>
          <div className="table-cell cell-source">Source</div>
          <div className="table-cell cell-date">Updated</div>
          <div className="table-cell cell-actions">Actions</div>
        </div>

        {isLoading ? (
          <div className="flex-center" style={{ padding: '3rem' }}>Loading leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex-center" style={{ padding: '3rem', color: 'var(--color-text-muted)' }}>
            No leads found matching your criteria.
          </div>
        ) : (
          <div ref={parentRef} className="virtual-container">
            <div className="virtual-inner" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const lead = filteredLeads[virtualRow.index];
                const validNext = getValidNextStatuses(lead.status);
                const isSelected = selectedIds.has(lead.id);

                return (
                  <div
                    key={lead.id}
                    className="table-row virtual-row"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      backgroundColor: isSelected ? 'var(--color-primary-subtle)' : undefined
                    }}
                  >
                    <div className="table-cell cell-checkbox">
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelection(lead.id)}
                      />
                    </div>
                    <div className="table-cell cell-name">{lead.name}</div>
                    <div className="table-cell cell-email">{lead.email}</div>
                    <div className="table-cell cell-status">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Badge status={lead.status} />
                        {!isLocked(lead.status) && (
                          <select
                            className="action-select"
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead, e.target.value as Status)}
                            style={{ opacity: 0.5, border: 'none', background: 'transparent' }}
                          >
                            <option value={lead.status}>{lead.status}</option>
                            {validNext.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="table-cell cell-source">{lead.source || '-'}</div>
                    <div className="table-cell cell-date">
                      {new Date(lead.updated_at).toLocaleDateString()}
                    </div>
                    <div className="table-cell cell-actions">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/leads/${lead.id}`)}>
                        <Eye size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/leads/${lead.id}/edit`)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeletingLead(lead)}>
                        <Trash2 size={16} color="var(--color-danger)" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <LeadModal
        isOpen={!!isNewMatch || !!isEditMatch}
        onClose={() => navigate('/leads')}
        initialData={isEditMatch && leads.length ? leads.find(l => l.id === isEditMatch.params.id) : null}
        title={isEditMatch ? 'Edit Lead' : 'Create New Lead'}
        onSubmit={async (data) => {
          if (isEditMatch) {
            await updateMutation.mutateAsync({ id: isEditMatch.params.id as string, data });
          } else {
            await createMutation.mutateAsync(data);
          }
        }}
      />

      <DeleteModal
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deletingLead?.name}? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending}
        onConfirm={async () => {
          if (deletingLead) {
            await deleteMutation.mutateAsync(deletingLead.id);
          }
        }}
      />
    </div>
  );
};
