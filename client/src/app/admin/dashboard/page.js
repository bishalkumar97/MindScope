'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, Title, DoughnutController, Filler,
} from 'chart.js';
import { Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, DoughnutController, Filler);

const API = 'https://mind-scope-87ko.vercel.app/api';

const chartColors = [
  '#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

function CustomLegend({ data, labelKey }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((sum, d) => sum + d.count, 0);
  return (
    <div className="chart-legend-custom">
      {data.map((item, i) => {
        const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
        return (
          <div key={i} className="legend-item">
            <div className="legend-dot" style={{ background: chartColors[i % chartColors.length] }} />
            <span>{item[labelKey] || 'Unknown'}</span>
            <span className="legend-count">{item.count}</span>
            <span className="legend-percent">({pct}%)</span>
          </div>
        );
      })}
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', color: 'var(--text-muted)',
      gap: '12px',
    }}>
      <div style={{ fontSize: '40px', opacity: 0.5 }}>📊</div>
      <p style={{ fontSize: '13px' }}>{message || 'No data yet'}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { router.push('/admin'); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API}/stats`), fetch(`${API}/responses`),
      ]);
      setStats(await statsRes.json());
      const usersData = await usersRes.json();
      setUsers(usersData.users || []);
    } catch (err) { console.error('Dashboard load error:', err); }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse" style={{ fontSize: '48px' }}>📊</div>
      </div>
    );
  }

  const total = stats?.total || 0;

  // Tooltip with percentage
  const tooltipConfig = {
    backgroundColor: '#161630',
    titleColor: '#f0f0ff',
    bodyColor: '#94a3b8',
    borderColor: 'rgba(14,165,233,0.3)',
    borderWidth: 1,
    cornerRadius: 8,
    padding: 12,
    bodyFont: { family: 'Inter', size: 13 },
    titleFont: { family: 'Inter', size: 14, weight: 'bold' },
    callbacks: {
      label: (ctx) => {
        const dataset = ctx.dataset;
        const currentValue = dataset.data[ctx.dataIndex];
        const totalVal = dataset.data.reduce((a, b) => a + b, 0);
        const pct = totalVal > 0 ? ((currentValue / totalVal) * 100).toFixed(1) : 0;
        return ` ${ctx.label}: ${currentValue} respondents (${pct}%)`;
      },
    },
  };

  const createDoughnutData = (distribution, labelKey) => ({
    labels: distribution?.map(d => d[labelKey] || 'Unknown') || [],
    datasets: [{
      data: distribution?.map(d => d.count) || [],
      backgroundColor: chartColors.slice(0, distribution?.length || 0),
      borderColor: '#0a0a0f',
      borderWidth: 4,
      hoverBorderColor: '#1e293b',
      hoverOffset: 8,
    }],
  });

  const createBarData = (distribution, labelKey, barColor) => ({
    labels: distribution?.map(d => d[labelKey] || 'Unknown') || [],
    datasets: [{
      label: 'Respondents',
      data: distribution?.map(d => d.count) || [],
      backgroundColor: barColor
        ? distribution?.map(() => barColor + '66') || []
        : chartColors.slice(0, distribution?.length || 0).map(c => c + '88'),
      borderColor: barColor
        ? distribution?.map(() => barColor) || []
        : chartColors.slice(0, distribution?.length || 0),
      borderWidth: 2,
      borderRadius: 10,
      borderSkipped: false,
      hoverBackgroundColor: barColor
        ? distribution?.map(() => barColor + 'cc') || []
        : chartColors.slice(0, distribution?.length || 0).map(c => c + 'cc'),
    }],
  });

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: tooltipConfig,
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: tooltipConfig,
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: tooltipConfig,
    },
    scales: {
      x: {
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        grid: { color: 'rgba(30, 41, 59, 0.3)', drawBorder: false },
      },
      y: {
        ticks: { color: '#64748b', font: { family: 'Inter' }, stepSize: 1, padding: 8 },
        grid: { color: 'rgba(30, 41, 59, 0.3)', drawBorder: false },
        beginAtZero: true,
      },
    },
  };

  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin');
  };

  const getBadge = (value, type) => {
    let cls = '';
    if (type === 'attachment') {
      cls = value === 'Secure' ? 'badge-secure' : value === 'Anxious' ? 'badge-anxious' : 'badge-avoidant';
    } else {
      cls = value === 'Low' ? 'badge-low' : value === 'Moderate' ? 'badge-moderate' : 'badge-high';
    }
    return <span className={`badge ${cls}`}>{value || '-'}</span>;
  };

  // Compute most common values
  const mostCommon = (dist, key) => {
    if (!dist || dist.length === 0) return '-';
    const sorted = [...dist].sort((a, b) => b.count - a.count);
    return sorted[0][key] || '-';
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 28px', borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🧠</span>
          <span style={{
            fontSize: '18px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MindScope</span>
          <span style={{
            padding: '3px 10px', background: 'rgba(14,165,233,0.1)',
            border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px',
            fontSize: '11px', color: 'var(--blue-secondary)', fontWeight: 600,
          }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Welcome, Riya 👋</span>
          <button className="btn-primary" onClick={() => {
            const link = document.createElement('a');
            link.href = `${API}/export-excel`;
            link.download = 'MindScope_Survey_Data.xlsx';
            link.click();
          }} style={{ fontSize: '12px', padding: '6px 16px' }}>📥 Export Excel</button>
          <button className="btn-secondary" onClick={handleLogout}
            style={{ fontSize: '12px', padding: '6px 16px' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '28px' }}>
        {/* Stats Row */}
        <div className="animate-fadeInUp" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px', marginBottom: '28px',
        }}>
          {[
            { icon: '👥', label: 'Total Responses', value: total },
            { icon: '📊', label: 'Most Common Attachment', value: mostCommon(stats?.attachmentDistribution, 'attachmentStyle') },
            { icon: '🏠', label: 'Most Common Invalidation', value: mostCommon(stats?.invalidationDistribution, 'invalidationLevel') },
            { icon: '🎭', label: 'Top Emotion Strategy', value: mostCommon(stats?.emotionRegulationDistribution, 'emotionRegulationTendency') },
            { icon: '📍', label: 'Top Location', value: mostCommon(stats?.locationDistribution, 'state') },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ animation: `fadeInUp 0.4s ease-out ${i * 0.08}s both` }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.icon}</div>
              <div className="stat-value" style={{ fontSize: typeof s.value === 'number' ? '36px' : '18px' }}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts — Row 1: Doughnuts */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px', marginBottom: '20px',
        }}>
          {/* Gender Distribution — Doughnut */}
          <div className="chart-container blue animate-fadeInUp">
            <div className="chart-header">
              <div>
                <div className="chart-title">📊 Gender Distribution</div>
                <div className="chart-subtitle">Breakdown of respondents by gender identity</div>
              </div>
              {total > 0 && <div className="chart-value-big">{total}</div>}
            </div>
            <div style={{ height: '240px' }}>
              {stats?.genderDistribution?.length > 0
                ? <Doughnut data={createDoughnutData(stats.genderDistribution, 'gender')} options={doughnutOptions} />
                : <EmptyChart message="No gender data yet share the survey!" />}
            </div>
            <CustomLegend data={stats?.genderDistribution} labelKey="gender" />
          </div>

          {/* Age Distribution — Doughnut */}
          <div className="chart-container purple animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">🎂 Age Distribution</div>
                <div className="chart-subtitle">Age groups of young adult respondents (18-30)</div>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              {stats?.ageDistribution?.length > 0
                ? <Doughnut data={createDoughnutData(stats.ageDistribution, 'ageGroup')} options={doughnutOptions} />
                : <EmptyChart message="No age data yet" />}
            </div>
            <CustomLegend data={stats?.ageDistribution} labelKey="ageGroup" />
          </div>

          {/* Invalidation Levels — Pie */}
          <div className="chart-container amber animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">🏠 Invalidation Levels</div>
                <div className="chart-subtitle">Childhood emotional invalidation severity distribution</div>
              </div>
            </div>
            <div style={{ height: '240px' }}>
              {stats?.invalidationDistribution?.length > 0
                ? <Pie data={createDoughnutData(stats.invalidationDistribution, 'invalidationLevel')} options={pieOptions} />
                : <EmptyChart message="No invalidation data yet" />}
            </div>
            <CustomLegend data={stats?.invalidationDistribution} labelKey="invalidationLevel" />
          </div>
        </div>

        {/* Charts — Row 2: Bar Charts */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px', marginBottom: '20px',
        }}>
          {/* Attachment Style — Bar */}
          <div className="chart-container green animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">💝 Attachment Style Distribution</div>
                <div className="chart-subtitle">Secure vs Anxious vs Avoidant attachment patterns</div>
              </div>
            </div>
            <div style={{ height: '280px' }}>
              {stats?.attachmentDistribution?.length > 0
                ? <Bar data={createBarData(stats.attachmentDistribution, 'attachmentStyle')} options={barOptions} />
                : <EmptyChart message="No attachment data yet" />}
            </div>
            <CustomLegend data={stats?.attachmentDistribution} labelKey="attachmentStyle" />
          </div>

          {/* Emotion Regulation — Bar */}
          <div className="chart-container cyan animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">🎭 Emotion Regulation Strategies</div>
                <div className="chart-subtitle">Cognitive reappraisal vs Expressive suppression vs Balanced</div>
              </div>
            </div>
            <div style={{ height: '280px' }}>
              {stats?.emotionRegulationDistribution?.length > 0
                ? <Bar data={createBarData(stats.emotionRegulationDistribution, 'emotionRegulationTendency', '#06b6d4')} options={barOptions} />
                : <EmptyChart message="No emotion regulation data yet" />}
            </div>
            <CustomLegend data={stats?.emotionRegulationDistribution} labelKey="emotionRegulationTendency" />
          </div>
        </div>

        {/* Charts — Row 3: Location + Education */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px', marginBottom: '28px',
        }}>
          {/* Top Locations — Bar */}
          <div className="chart-container red animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">📍 Top Locations</div>
                <div className="chart-subtitle">Where respondents are from (by state/province)</div>
              </div>
            </div>
            <div style={{ height: '250px' }}>
              {stats?.locationDistribution?.length > 0
                ? <Bar data={createBarData(stats.locationDistribution, 'state', '#ef4444')} options={barOptions} />
                : <EmptyChart message="No location data yet" />}
            </div>
          </div>

          {/* Education — Doughnut */}
          <div className="chart-container purple animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
            <div className="chart-header">
              <div>
                <div className="chart-title">🎓 Education Level</div>
                <div className="chart-subtitle">Academic background of respondents</div>
              </div>
            </div>
            <div style={{ height: '250px' }}>
              {stats?.educationDistribution?.length > 0
                ? <Doughnut data={createDoughnutData(stats.educationDistribution, 'education')} options={doughnutOptions} />
                : <EmptyChart message="No education data yet" />}
            </div>
            <CustomLegend data={stats?.educationDistribution} labelKey="education" />
          </div>
        </div>

        {/* Respondents Table */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              👥 All Respondents
              <span style={{
                padding: '2px 10px', background: 'rgba(14,165,233,0.1)',
                borderRadius: '12px', fontSize: '12px', color: 'var(--blue-primary)', fontWeight: 700,
              }}>{filteredUsers.length}</span>
            </h3>
            <input
              className="input-field"
              style={{ maxWidth: '300px', padding: '10px 16px', fontSize: '13px' }}
              placeholder="🔍 Search by name, email, location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <p>{users.length === 0 ? 'No responses yet. Share your survey to get started!' : 'No results match your search.'}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Location</th>
                    <th>Attachment</th>
                    <th>Invalidation</th>
                    <th>Emotion Reg.</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, i) => (
                    <tr key={user.id} className="data-row"
                      onClick={() => router.push(`/admin/dashboard/${user.id}`)}
                      style={{ animation: `fadeInUp 0.3s ease-out ${i * 0.03}s both` }}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.age}</td>
                      <td>{user.gender}</td>
                      <td>{user.city}{user.state ? `, ${user.state}` : ''}</td>
                      <td>{getBadge(user.attachmentStyle, 'attachment')}</td>
                      <td>{getBadge(user.invalidationLevel, 'invalidation')}</td>
                      <td style={{ fontSize: '12px' }}>{user.emotionRegulationTendency || '-'}</td>
                      <td style={{ fontSize: '12px' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
