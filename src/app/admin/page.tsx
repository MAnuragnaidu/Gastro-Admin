import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { prisma } from '@/lib/prisma';
import RefreshButton from './RefreshButton';

export const metadata = {
  title: 'Admin Dashboard - MyGastro.Ai',
};

export default async function AdminPage() {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('userRole');
  if (userRole?.value !== 'ADMIN') {
    redirect('/');
  }

  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  const totalPatients = patients.length;
  const remissionCount = patients.filter(p => p.currentDiseaseActivity === 'Remission').length;
  const severeCount = patients.filter(p => p.currentDiseaseActivity === 'Severe').length;
  const moderateCount = patients.filter(p => p.currentDiseaseActivity === 'Moderate').length;

  const activityStyles: Record<string, { color: string; bg: string; border: string }> = {
    Remission: { color: '#166534', bg: '#dcfce7', border: '#bbf7d0' },
    Mild: { color: '#854d0e', bg: '#fef9c3', border: '#fde68a' },
    Moderate: { color: '#9a3412', bg: '#ffedd5', border: '#fed7aa' },
    Severe: { color: '#991b1b', bg: '#fee2e2', border: '#fecaca' },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .ad-root {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0f172a;
        }

        .ad-nav {
          background: #0f172a;
          border-bottom: 1px solid #1e293b;
          padding: 0 32px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ad-nav-brand {
          font-size: 15px;
          font-weight: 600;
          color: #ffffff;
        }
        .ad-nav-brand span { color: #2dd4bf; }
        .ad-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ad-nav-role {
          font-size: 12px;
          color: #94a3b8;
          background: #1e293b;
          border: 1px solid #334155;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 500;
        }

        .ad-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px 60px;
        }

        .ad-page-heading {
          font-size: 20px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .ad-page-sub {
          font-size: 13px;
          color: #475569;
          margin-bottom: 28px;
        }

        .ad-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        @media (max-width: 768px) {
          .ad-stats { grid-template-columns: repeat(2, 1fr); }
          .ad-page { padding: 20px 16px 40px; }
          .ad-nav { padding: 0 16px; }
        }

        .ad-stat {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 18px 20px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .ad-stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .ad-stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0f172a;
          line-height: 1;
          margin-bottom: 2px;
        }
        .ad-stat-desc {
          font-size: 11px;
          color: #94a3b8;
        }

        .ad-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .ad-card-header {
          padding: 14px 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ad-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        .ad-card-count {
          font-size: 12px;
          color: #475569;
        }

        .ad-table {
          width: 100%;
          border-collapse: collapse;
        }
        .ad-table thead th {
          padding: 10px 16px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          white-space: nowrap;
        }
        .ad-table tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.1s;
        }
        .ad-table tbody tr:last-child { border-bottom: none; }
        .ad-table tbody tr:hover { background: #f8fafc; }
        .ad-table td {
          padding: 12px 16px;
          font-size: 13px;
          color: #475569;
          vertical-align: middle;
        }

        .td-id { font-size: 12px; color: #334155; }
        .td-date { font-size: 12px; color: #475569; white-space: nowrap; }
        .td-name {
          font-weight: 500;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .td-avatar {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0369a1;
          font-size: 12px;
          font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .td-mrn { font-size: 12px; color: #475569; }
        .td-email { font-size: 12px; color: #475569; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .td-dx { font-size: 13px; color: #334155; font-weight: 500; }
        .td-activity {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 11.5px;
          font-weight: 500;
          white-space: nowrap;
        }
        .td-activity-dot { width: 5px; height: 5px; border-radius: 50%; }
        .td-age { font-size: 13px; color: #334155; }
        .td-view a {
          font-size: 12px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          padding: 5px 12px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          transition: all 0.15s;
          white-space: nowrap;
          display: inline-block;
        }
        .td-view a:hover { background: #f1f5f9; color: #0f172a; }

        .ad-empty {
          text-align: center;
          padding: 48px 20px;
          color: #94a3b8;
          font-size: 13px;
        }
      `}</style>

      <div className="ad-root">
        <nav className="ad-nav">
          <div className="ad-nav-brand">myGastro<span>.AI</span></div>
          <div className="ad-nav-right">
            <span className="ad-nav-role">Admin</span>
            <LogoutButton />
          </div>
        </nav>

        <div className="ad-page">
          <h1 className="ad-page-heading">Patient Submissions</h1>
          <p className="ad-page-sub">All intake forms submitted by clinicians</p>

          <div className="ad-stats">
            <div className="ad-stat">
              <div className="ad-stat-label">Total Patients</div>
              <div className="ad-stat-value">{totalPatients}</div>
              <div className="ad-stat-desc">All submissions</div>
            </div>
            <div className="ad-stat">
              <div className="ad-stat-label">In Remission</div>
              <div className="ad-stat-value" style={{ color: '#16a34a' }}>{remissionCount}</div>
              <div className="ad-stat-desc">Currently stable</div>
            </div>
            <div className="ad-stat">
              <div className="ad-stat-label">Moderate Activity</div>
              <div className="ad-stat-value" style={{ color: '#ea580c' }}>{moderateCount}</div>
              <div className="ad-stat-desc">Needs review</div>
            </div>
            <div className="ad-stat">
              <div className="ad-stat-label">Severe Activity</div>
              <div className="ad-stat-value" style={{ color: '#dc2626' }}>{severeCount}</div>
              <div className="ad-stat-desc">Urgent attention</div>
            </div>
          </div>

          <div className="ad-card">
            <div className="ad-card-header">
              <div>
                <span className="ad-card-title block mb-1">All Submissions</span>
                <span className="ad-card-count">{totalPatients} records</span>
              </div>
              <RefreshButton />
            </div>
            <table className="ad-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Patient Name</th>
                  <th>MRN</th>
                  <th>Submitter</th>
                  <th>Diagnosis</th>
                  <th>Activity</th>
                  <th>Age</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <div className="ad-empty">No submissions yet.</div>
                    </td>
                  </tr>
                ) : (
                  patients.map((p) => {
                    const act = activityStyles[p.currentDiseaseActivity] || { color: '#475569', bg: '#f1f5f9', border: '#e2e8f0' };
                    return (
                      <tr key={p.id}>
                        <td className="td-id">#{p.id}</td>
                        <td className="td-date">
                          {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <div className="td-name">
                            <div className="td-avatar">{p.name?.charAt(0).toUpperCase()}</div>
                            {p.name}
                          </div>
                        </td>
                        <td className="td-mrn">{p.mrn || '—'}</td>
                        <td className="td-email" title={p.user?.email}>{p.user?.email || 'Unknown'}</td>
                        <td className="td-dx">{p.primaryDiagnosis || '—'}</td>
                        <td>
                          <span
                            className="td-activity"
                            style={{ color: act.color, background: act.bg, border: `1px solid ${act.border}` }}
                          >
                            <span className="td-activity-dot" style={{ background: act.color }} />
                            {p.currentDiseaseActivity || '—'}
                          </span>
                        </td>
                        <td className="td-age">{p.currentAge ? `${p.currentAge} yrs` : '—'}</td>
                        <td className="td-view">
                          <a href={`/admin/patient/${p.id}`} style={{ marginRight: '8px' }}>View details</a>
                          <a href={`/admin/patient/${p.id}/assessment`} style={{ background: 'rgba(13,148,136,0.08)', borderColor: 'rgba(13,148,136,0.25)', color: '#0d9488' }}>Assessment</a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
