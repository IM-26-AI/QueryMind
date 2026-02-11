import { useState } from 'react';
import type { FormEvent } from 'react'; 
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/token', formData);
      
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* --- Main Card --- */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔐 AI Analyst</h1>
          <p style={styles.subtitle}>Sign in to access your dashboard</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="text" 
              placeholder="admin@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={styles.input}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={loading ? styles.buttonDisabled : styles.button}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* --- Developers Section --- */}
        <div style={styles.devSection}>
          <p style={styles.devTitle}>Built by</p>
          <div style={styles.devGrid}>
            
            {/* Developer 1 (You) */}
            <div style={styles.devBadge}>
              <div style={styles.avatar}>👨‍💻</div>
              <div>
                <strong style={styles.devName}>Mohsin Moiz Ali</strong>
                <span style={styles.devRole}>meghani.mohsin@gmail.com</span>
              </div>
            </div>

            {/* Developer 2 (Friend) */}
            <div style={styles.devBadge}>
              <div style={styles.avatar}>🧠</div>
              <div>
                <strong style={styles.devName}>Ilham Shaikh</strong>
                <span style={styles.devRole}>shaikhilhaam14@gmail.com</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- CSS-in-JS Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', // Subtle grey-blue gradient
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    background: '#ffffff',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', // Soft shadow
    width: '100%',
    maxWidth: '420px',
    border: '1px solid rgba(255,255,255,0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.8rem',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    outline: 'none',
    background: '#f9f9f9',
  },
  button: {
    padding: '12px',
    marginTop: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: '#2563eb', // Modern blue
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
  },
  buttonDisabled: {
    padding: '12px',
    marginTop: '1rem',
    borderRadius: '8px',
    border: 'none',
    background: '#93c5fd',
    color: 'white',
    cursor: 'not-allowed',
  },
  error: {
    background: '#fef2f2',
    color: '#dc2626',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '1rem',
    textAlign: 'center',
    border: '1px solid #fecaca',
  },
  devSection: {
    marginTop: '2.5rem',
    borderTop: '1px solid #eee',
    paddingTop: '1.5rem',
  },
  devTitle: {
    textAlign: 'center',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#999',
    marginBottom: '1rem',
  },
  devGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  devBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    borderRadius: '8px',
    background: '#f8fafc',
    border: '1px solid #f1f5f9',
  },
  avatar: {
    fontSize: '1.5rem',
    background: 'white',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  devName: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#333',
  },
  devRole: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#666',
  }
};

export default Login;