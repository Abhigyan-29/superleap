import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, Calendar, Globe, MapPin } from 'lucide-react';

import { leadsApi } from '../api/leads';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

import './LeadDetails.css';

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: lead, isLoading, isError } = useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.getLead(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="page-wrapper container flex-center">Loading lead details...</div>;
  }

  if (isError || !lead) {
    return (
      <div className="page-wrapper container flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
        <h2>Lead Not Found</h2>
        <Button onClick={() => navigate('/leads')}>Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="page-wrapper container">
      <Button variant="ghost" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} style={{ marginBottom: '2rem' }}>
        Back
      </Button>

      <div className="lead-details-card glass">
        <div className="lead-details-header">
          <div className="lead-avatar">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div className="lead-title-group">
            <h1 className="lead-name">{lead.name}</h1>
            <div className="lead-badges">
              <Badge status={lead.status} />
              <span className="lead-source">{lead.source || 'Direct'}</span>
            </div>
          </div>
          <div className="lead-header-actions">
            <Button onClick={() => navigate(`/leads/${lead.id}/edit`)}>Edit Lead</Button>
          </div>
        </div>

        <div className="lead-details-grid">
          <div className="details-section">
            <h3>Contact Information</h3>
            <div className="info-list">
              <div className="info-item">
                <Mail size={18} className="info-icon" />
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </div>
              <div className="info-item">
                <Phone size={18} className="info-icon" />
                <a href={`tel:${lead.phone}`}>{lead.phone || 'No phone provided'}</a>
              </div>
              <div className="info-item">
                <Globe size={18} className="info-icon" />
                <span>{lead.source || 'Website'}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>System Info</h3>
            <div className="info-list">
              <div className="info-item">
                <Calendar size={18} className="info-icon" />
                <span>Created: {new Date(lead.created_at).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <Calendar size={18} className="info-icon" />
                <span>Updated: {new Date(lead.updated_at).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <MapPin size={18} className="info-icon" />
                <span>ID: {lead.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
