'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px',
        animation: visible ? 'fadeInDown 0.6s ease-out' : 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🧠</span>
          <span style={{
            fontSize: '22px', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>MindScope</span>
        </div>
        <button className="btn-secondary" onClick={() => router.push('/admin')}
          style={{ fontSize: '13px', padding: '8px 20px' }}>
          Admin Panel
        </button>
      </nav>

      {/* Hero Section */}
      <main style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '60px',
          maxWidth: '1100px', width: '100%', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {/* Text Content */}
          <div style={{
            flex: '1 1 450px', maxWidth: '550px',
            animation: visible ? 'fadeInUp 0.8s ease-out' : 'none',
          }}>
            <div style={{
              display: 'inline-block', padding: '6px 16px',
              background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
              borderRadius: '20px', fontSize: '13px', color: 'var(--blue-secondary)',
              marginBottom: '20px',
            }}>
              🎓 Psychology Research by Riya
            </div>

            <h1 style={{
              fontSize: '44px', fontWeight: 900, lineHeight: 1.15,
              marginBottom: '20px',
            }}>
              Discover Your{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--blue-primary), var(--blue-secondary))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>Personality</span>{' '}
              Profile
            </h1>

            <p style={{
              fontSize: '17px', color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: '32px',
            }}>
              Explore the relationship between your childhood emotional environment,
              attachment style, and how you regulate emotions. This short 5-10 minute survey
              gives you personalized insights based on validated psychology scales.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => router.push('/survey')}
                style={{ fontSize: '17px', padding: '16px 40px' }}>
                Start Survey →
              </button>
            </div>

            <div style={{
              display: 'flex', gap: '40px', marginTop: '40px',
            }}>
              {[
                { label: 'Questions', value: '32' },
                { label: 'Minutes', value: '5-10' },
                { label: 'Confidential', value: '100%' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '24px', fontWeight: 800, color: 'var(--blue-primary)',
                  }}>{s.value}</div>
                  <div style={{
                    fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '1px', marginTop: '4px',
                  }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Animated Character */}
          <div style={{
            flex: '0 0 320px',
            animation: visible ? 'fadeInUp 1s ease-out 0.3s both' : 'none',
          }}>
            <div style={{
              width: '320px', height: '320px', position: 'relative',
            }}>
              {/* Glow ring */}
              <div className="animate-pulse" style={{
                position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
              }} />

              {/* Character */}
              <div className="animate-float" style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '160px',
                filter: 'drop-shadow(0 0 40px rgba(14,165,233,0.4))',
              }}>
                🧠
              </div>

              {/* Floating particles */}
              {['✨', '💡', '🔬', '📊'].map((emoji, i) => (
                <div key={i} className="animate-float" style={{
                  position: 'absolute',
                  top: `${[10, 60, 85, 30][i]}%`,
                  left: `${[80, 5, 65, 90][i]}%`,
                  fontSize: '24px',
                  animationDelay: `${i * 0.7}s`,
                  opacity: 0.7,
                }}>{emoji}</div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features */}
      <section style={{
        padding: '60px 40px',
        animation: visible ? 'fadeInUp 1s ease-out 0.5s both' : 'none',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px', maxWidth: '1100px', margin: '0 auto',
        }}>
          {[
            { icon: '🏠', title: 'Childhood Environment', desc: 'Understand how your early emotional experiences shaped you' },
            { icon: '💝', title: 'Attachment Style', desc: 'Discover your patterns in close relationships' },
            { icon: '🎭', title: 'Emotion Regulation', desc: 'Learn how you manage your emotional responses' },
          ].map((f, i) => (
            <div key={i} className="glass-card" style={{
              padding: '32px', textAlign: 'center',
              animationDelay: `${0.6 + i * 0.15}s`,
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>{f.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px 40px', textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        color: 'var(--text-muted)', fontSize: '13px',
      }}>
        © 2026 MindScope |Psychology Research by Riya | All responses are confidential
      </footer>
    </div>
  );
}
