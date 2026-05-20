import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LeadsList } from './pages/LeadsList';
import { LeadsBoard } from './pages/LeadsBoard';
import { LeadDetails } from './pages/LeadDetails';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/leads" replace />} />
        <Route path="leads" element={<LeadsList />}>
          <Route path="new" element={null} />
          <Route path=":id/edit" element={null} />
        </Route>
        <Route path="leads/:id" element={<LeadDetails />} />
        <Route path="board" element={<LeadsBoard />} />
      </Route>
    </Routes>
  );
};

export default App;
