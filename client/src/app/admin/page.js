'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('https://mind-scope-87ko.vercel.app/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        router.push('/admin/dashboard');
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch {
      setError('Cannot connect to server. Make sure it\'s running.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="glass-card animate-bounceIn" style={{
        padding: '48px', width: '100%', maxWidth: '420px', textAlign: 'center',
      }}>
        {/* Logo */}
        <div className="animate-float" style={{
          width: '80px', height: '80px', margin: '0 auto 24px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px',
          boxShadow: '0 0 40px rgba(14,165,233,0.3)',
        }}>
          🔐
        </div>

        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          Admin Panel
        </h1>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '32px',
        }}>
          Enter your password to access the dashboard
        </p>

        <form onSubmit={handleLogin}>
          <input
            className="input-field"
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ marginBottom: '16px', textAlign: 'center', fontSize: '16px' }}
            autoFocus
          />

          {error && (
            <p style={{
              color: 'var(--danger)', fontSize: '13px', marginBottom: '16px',
              animation: 'fadeIn 0.3s ease-out',
            }}>
              {error}
            </p>
          )}

          <button className="btn-primary" type="submit"
            disabled={!password || loading}
            style={{ width: '100%' }}>
            {loading ? '🔄 Verifying...' : '🚀 Access Dashboard'}
          </button>
        </form>

        <button className="btn-secondary" onClick={() => router.push('/')}
          style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
