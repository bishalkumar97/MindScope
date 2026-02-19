'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const API = 'https://mind-scope-87ko.vercel.app/api';

export default function ResponseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
        padding: '16px 32px', borderBottom: '1px solid var(--border-color)',
        background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🧠</span>
          <span style={{
            fontSize: '18px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MindScope</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/ Response Detail</span>
        </div>
        <button className="btn-secondary" onClick={() => router.push('/admin/dashboard')}
          style={{ fontSize: '13px', padding: '8px 20px' }}>
          ← Back to Dashboard
        </button>
      </nav>

      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* User Info Card */}
        <div className="glass-card animate-fadeInUp" style={{
          padding: '32px', marginBottom: '24px',
          display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center',
        }}>
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: 800, flexShrink: 0,
            boxShadow: '0 0 30px rgba(14,165,233,0.3)',
          }}>
            {user.fullName?.charAt(0)?.toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{user.fullName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{user.email}</p>
            <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
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
                💼 Occupation: <strong style={{ color: 'var(--text-primary)' }}>{user.occupation}</strong>
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                📍 Location: <strong style={{ color: 'var(--text-primary)' }}>{user.city}, {user.state}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
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
            <div key={sectionKey} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{
                fontSize: '16px', fontWeight: 700, marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                {sectionInfo.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sectionAnswers.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)', gap: '16px',
                    borderLeft: `3px solid ${sectionInfo.color}`,
                  }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', flex: 1 }}>
                      <span style={{ color: sectionInfo.color, fontWeight: 700 }}>
                        Q{a.questionIndex + 1}.{' '}
                      </span>
                      {a.questionText}
                    </p>
                    <div style={{
                      padding: '6px 16px', background: `${sectionInfo.color}22`,
                      borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                      color: sectionInfo.color, flexShrink: 0, textAlign: 'center',
                      minWidth: '100px',
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
