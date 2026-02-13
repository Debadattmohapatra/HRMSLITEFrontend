import { useState, useEffect } from 'react';
import { Users, Calendar, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { dashboardAPI } from '../api';
import { Link } from 'react-router-dom';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onClose={() => setError(null)} />;
  }

  if (!stats) {
    return <ErrorMessage message="No data available" />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your HR management system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Total Employees</div>
              <div className="stat-card-value">{stats.total_employees || 0}</div>
            </div>
            <div className="stat-card-icon blue">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <Link to="/employees" className="text-sm" style={{ color: 'var(--primary-600)', fontWeight: 500 }}>
            View all employees →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Attendance Records</div>
              <div className="stat-card-value">{stats.total_attendance_records || 0}</div>
            </div>
            <div className="stat-card-icon purple">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <Link to="/attendance" className="text-sm" style={{ color: 'var(--primary-600)', fontWeight: 500 }}>
            View attendance →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Today's Present</div>
              <div className="stat-card-value">{stats.today_stats?.present || 0}</div>
            </div>
            <div className="stat-card-icon green">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--gray-600)' }}>
            {((stats.today_stats?.present / (stats.today_stats?.total || 1)) * 100).toFixed(0)}% attendance rate
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <div className="stat-card-label">Today's Absent</div>
              <div className="stat-card-value">{stats.today_stats?.absent || 0}</div>
            </div>
            <div className="stat-card-icon red">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--gray-600)' }}>
            Requires attention
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--gray-900)' }}>
            Today's Summary
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--gray-50)', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--gray-700)', fontWeight: 500 }}>Date</span>
              <span style={{ fontSize: '14px', color: 'var(--gray-900)', fontWeight: 600 }}>
                {stats.today_stats?.date || new Date().toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--success-light)', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--gray-700)', fontWeight: 500 }}>Present</span>
              <span style={{ fontSize: '14px', color: '#065F46', fontWeight: 700 }}>
                {stats.today_stats?.present || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--error-light)', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--gray-700)', fontWeight: 500 }}>Absent</span>
              <span style={{ fontSize: '14px', color: '#991B1B', fontWeight: 700 }}>
                {stats.today_stats?.absent || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--info-light)', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--gray-700)', fontWeight: 500 }}>Total Marked</span>
              <span style={{ fontSize: '14px', color: '#1E40AF', fontWeight: 700 }}>
                {stats.today_stats?.total || 0}
              </span>
            </div>
          </div>
        </div>

        {stats.departments && stats.departments.length > 0 && (
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', color: 'var(--gray-900)' }}>
              Departments
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.departments.map((dept, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--gray-50)',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontSize: '14px', color: 'var(--gray-700)', fontWeight: 600 }}>
                    {dept.department}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp style={{ width: '16px', height: '16px', color: 'var(--primary-600)' }} />
                    <span style={{ fontSize: '14px', color: 'var(--gray-900)', fontWeight: 700 }}>
                      {dept.count} {dept.count === 1 ? 'employee' : 'employees'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {stats.recent_attendance && stats.recent_attendance.length > 0 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gray-900)' }}>
              Recent Attendance
            </h2>
            <Link to="/attendance" style={{ fontSize: '14px', color: 'var(--primary-600)', fontWeight: 500 }}>
              View all →
            </Link>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="font-semibold">{record.employee_id_display}</td>
                    <td>{record.employee_name}</td>
                    <td className="text-gray-600">{record.date}</td>
                    <td>
                      <span className={`badge ${record.status === 'present' ? 'badge-success' : 'badge-error'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;