'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API = 'https://mind-scope-87ko.vercel.app/api';

export default function ResponseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    fetch(`${API}/responses/${params.id}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this response? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`${API}/responses/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (res.ok) {
        alert('Response deleted successfully');
        router.push('/admin/dashboard');
      } else {
        alert('Failed to delete response');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error connecting to server');
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse" style={{ fontSize: '48px' }}>🔍</div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>❌</div>
        <p style={{ color: 'var(--text-secondary)' }}>Respondent not found</p>
        <button className="btn-primary" onClick={() => router.push('/admin/dashboard')}>Back to Dashboard</button>
      </div>
    );
  }

  const { user, answers } = data;

  const sectionLabels = {
    invalidation: { title: '🏠 Childhood Emotional Invalidation', color: '#f59e0b' },
    attachment: { title: '💝 Attachment Style', color: '#6366f1' },
    emotion: { title: '🎭 Emotion Regulation', color: '#0ea5e9' },
  };

  const groupedAnswers = {};
  answers.forEach(a => {
    if (!groupedAnswers[a.section]) groupedAnswers[a.section] = [];
    groupedAnswers[a.section].push(a);
  });

  const getAttachmentColor = (style) => {
    if (style === 'Secure') return 'var(--success)';
    if (style === 'Anxious') return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'clamp(10px, 3vw, 16px) clamp(16px, 5vw, 32px)', 
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)',
        flexWrap: 'wrap', gap: '12px', sticky: 'top', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🧠</span>
          <span style={{
            fontSize: '18px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MindScope</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'none' }}>/ Detail</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={() => router.push('/admin/dashboard')}
            style={{ fontSize: '12px', padding: '6px 16px' }}>
            ← Back
          </button>
          <button 
            onClick={handleDelete}
            disabled={deleting}
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              padding: '6px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
          >
            {deleting ? 'Deleting...' : '🗑️ Delete'}
          </button>
        </div>
      </nav>

      <div style={{ padding: 'clamp(16px, 4vw, 32px)', maxWidth: '1000px', margin: '0 auto' }}>
        {/* User Info Card */}
        <div className="glass-card animate-fadeInUp" style={{
          padding: 'clamp(20px, 5vw, 32px)', marginBottom: '24px',
          display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Avatar */}
          <div style={{
            width: 'clamp(60px, 15vw, 80px)', height: 'clamp(60px, 15vw, 80px)', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'max(24px, 4vw)', fontWeight: 800, flexShrink: 0,
            boxShadow: '0 0 30px rgba(14,165,233,0.3)',
          }}>
            {user.fullName?.charAt(0)?.toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 'min(100%, 250px)' }}>
            <h2 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 800, marginBottom: '4px' }}>{user.fullName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', wordBreak: 'break-all' }}>{user.email}</p>
            <div style={{ display: 'flex', gap: 'x-small', marginTop: '16px', flexWrap: 'wrap', columnGap: '20px', rowGap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                🎂 Age: <strong style={{ color: 'var(--text-primary)' }}>{user.age}</strong>
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                👤 Gender: <strong style={{ color: 'var(--text-primary)' }}>{user.gender}</strong>
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                🎓 Education: <strong style={{ color: 'var(--text-primary)' }}>{user.education}</strong>
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                📍 Location: <strong style={{ color: 'var(--text-primary)' }}>{user.city}{user.state ? `, ${user.state}` : ''}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '16px', marginBottom: '24px',
        }}>
          <div className="stat-card animate-fadeInUp">
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏠</div>
            <div className="stat-label">Invalidation Level</div>
            <div style={{
              fontSize: '20px', fontWeight: 800, marginTop: '8px',
              color: user.invalidationLevel === 'Low' ? 'var(--success)' :
                user.invalidationLevel === 'Moderate' ? 'var(--warning)' : 'var(--danger)',
            }}>
              {user.invalidationLevel}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Score: {user.invalidationScore}%
            </div>
          </div>

          <div className="stat-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>💝</div>
            <div className="stat-label">Attachment Style</div>
            <div style={{
              fontSize: '20px', fontWeight: 800, marginTop: '8px',
              color: getAttachmentColor(user.attachmentStyle),
            }}>
              {user.attachmentStyle}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Score: {user.attachmentScore}/5
            </div>
          </div>

          <div className="stat-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎭</div>
            <div className="stat-label">Emotion Regulation</div>
            <div style={{
              fontSize: '16px', fontWeight: 800, marginTop: '8px',
              color: 'var(--blue-primary)',
            }}>
              {user.emotionRegulationTendency}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              R: {user.reappraisalScore}/7 | S: {user.suppressionScore}/7
            </div>
          </div>
        </div>

        {/* Personality Summary */}
        <div className="glass-card" style={{ padding: 'clamp(16px, 4vw, 24px)', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
            📋 Personality Summary
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
            {user.personalitySummary}
          </p>
        </div>

        {/* All Answers by Section */}
        {Object.entries(groupedAnswers).map(([sectionKey, sectionAnswers]) => {
          const sectionInfo = sectionLabels[sectionKey] || { title: sectionKey, color: '#0ea5e9' };
          return (
            <div key={sectionKey} className="glass-card" style={{ padding: 'clamp(16px, 4vw, 24px)', marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px', fontWeight: 700, marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                {sectionInfo.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sectionAnswers.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column',
                    padding: '16px', background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)', gap: '12px',
                    borderLeft: `4px solid ${sectionInfo.color}`,
                  }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <span style={{ color: sectionInfo.color, fontWeight: 800, marginRight: '8px' }}>
                        Q{a.questionIndex + 1}.
                      </span>
                      {a.questionText}
                    </p>
                    <div style={{
                      padding: '8px 16px', background: `${sectionInfo.color}22`,
                      borderRadius: '12px', fontSize: '12px', fontWeight: 700,
                      color: sectionInfo.color, alignSelf: 'flex-start',
                    }}>
                      {a.answer} — {a.answerText}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
          Response submitted on {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Unknown'}
        </div>
      </div>
    </div>
  );
}
