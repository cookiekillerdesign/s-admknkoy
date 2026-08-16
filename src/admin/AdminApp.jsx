import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthChange } from '../lib/auth';
import { supabaseReady } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import ProjectEditor from './ProjectEditor';
import './admin.css';

export default function AdminApp() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => onAuthChange(setSession), []);

  if (!supabaseReady) {
    return (
      <div className="adm-shell">
        <div className="adm-setup-notice">
          <h1>Supabase is not configured yet</h1>
          <p>
            Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in a
            <code> .env</code> file (local) or in your Vercel project's environment variables
            (production), then redeploy / restart the dev server.
          </p>
          <p>Full step-by-step setup is in <code>README-ADMIN.md</code> at the project root.</p>
        </div>
      </div>
    );
  }

  if (session === undefined) {
    return <div className="adm-shell adm-loading" />;
  }

  if (!session) {
    return <AdminLogin />;
  }

  return (
    <div className="adm-shell">
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="projects/:id" element={<ProjectEditor />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </div>
  );
}
