'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState(null);
  const [name, setName] = useState('');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('surveyResult');
    const storedName = localStorage.getItem('userName');
    if (stored) {
      setResult(JSON.parse(stored));
      setName(storedName || 'Friend');
      // Dramatic reveal delay
      setTimeout(() => setShowResult(true), 1500);
    }
  }, []);

  if (!result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>🧠</div>
        <p style={{ color: 'var(--text-secondary)' }}>No results found. Please take the survey first.</p>
        <button className="btn-primary" onClick={() => router.push('/survey')}>Take Survey</button>
      </div>
    );
  }

  if (!showResult) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '24px',
      }}>
        <div className="animate-pulse" style={{
          fontSize: '100px',
          filter: 'drop-shadow(0 0 40px rgba(14,165,233,0.5))',
        }}>🧠</div>
        <p style={{
          fontSize: '20px', fontWeight: 600,
          background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-secondary))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Analyzing your personality...</p>
        <div className="progress-bar-wrapper" style={{ width: '300px' }}>
          <div className="progress-bar-fill" style={{
            width: '100%', animation: 'none',
            transition: 'width 1.5s ease-in-out',
          }} />
        </div>
      </div>
    );
  }

  const getAttachmentColor = (style) => {
    if (style === 'Secure') return 'var(--success)';
    if (style === 'Anxious') return 'var(--warning)';
    return 'var(--danger)';
  };

  const getInvalidationColor = (level) => {
    if (level === 'Low') return 'var(--success)';
    if (level === 'Moderate') return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div className="animate-fadeInDown" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🎉</div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
            Your Personality Profile, {name.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here are your personalized insights based on validated psychology scales
          </p>
        </div>

        {/* Score Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px', marginBottom: '32px',
        }}>
          {/* Invalidation */}
          <div className="glass-card animate-fadeInUp" style={{ padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🏠</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Emotional Invalidation
            </div>
            <div style={{
              fontSize: '28px', fontWeight: 800, marginTop: '8px',
              color: getInvalidationColor(result.invalidationLevel),
            }}>
              {result.invalidationLevel}
            </div>
            <div style={{
              fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px',
            }}>
              Score: {result.invalidationScore}%
            </div>
          </div>

          {/* Attachment */}
          <div className="glass-card animate-fadeInUp" style={{
            padding: '28px', textAlign: 'center', animationDelay: '0.15s',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💝</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Attachment Style
            </div>
            <div style={{
              fontSize: '28px', fontWeight: 800, marginTop: '8px',
              color: getAttachmentColor(result.attachmentStyle),
            }}>
              {result.attachmentStyle}
            </div>
            <div style={{
              fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px',
            }}>
              Score: {result.attachmentScore}/5
            </div>
          </div>

          {/* Emotion Regulation */}
          <div className="glass-card animate-fadeInUp" style={{
            padding: '28px', textAlign: 'center', animationDelay: '0.3s',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎭</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Emotion Regulation
            </div>
            <div style={{
              fontSize: '22px', fontWeight: 800, marginTop: '8px',
              color: 'var(--blue-primary)',
            }}>
              {result.emotionRegulationTendency}
            </div>
            <div style={{
              fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px',
            }}>
              Reappraisal: {result.reappraisalScore}/7 | Suppression: {result.suppressionScore}/7
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="glass-card animate-fadeInUp" style={{
          padding: '32px', marginBottom: '32px', animationDelay: '0.45s',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📋</span> Your Detailed Summary
          </h3>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.8,
          }}>
            {result.personalitySummary}
          </p>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '20px', background: 'rgba(14,165,233,0.05)',
          border: '1px solid rgba(14,165,233,0.15)', borderRadius: 'var(--radius-sm)',
          marginBottom: '32px',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            ⚠️ <strong>Disclaimer:</strong> This analysis is for educational and research purposes only.
            It is not a clinical diagnosis. If you have concerns about your mental health,
            please consult a qualified mental health professional.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => router.push('/')}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
