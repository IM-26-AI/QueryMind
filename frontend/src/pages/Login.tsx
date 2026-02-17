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
    <div style={styles.pageContainer}>
      
      {/* --- LEFT SIDE: Login Form --- */}
      <div style={styles.formSection}>
        <div style={styles.formContainer}>
          
          {/* Logo / Brand */}
          <div style={styles.brandHeader}>
            <div style={styles.logoIcon}>✨</div>
            <h1 style={styles.brandName}>QueryMind</h1>
          </div>

          <h2 style={styles.heading}>Welcome back</h2>
          <p style={styles.subHeading}>Please enter your details to sign in.</p>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email address</label>
              <input 
                type="text" 
                placeholder="analyst@querymind.ai" 
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
              {loading ? 'Authenticating...' : 'Sign in'}
            </button>
          </form>

          <p style={styles.footerText}>
            Don't have an account? <span style={styles.link}>Contact Admin</span>
          </p>

          {/* Developers Section (Subtle Footer) */}
          <div style={styles.devFooter}>
            <p>Built by <strong>Mohsin Moiz Ali</strong> & <strong>Ilham Shaikh</strong></p>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: Visual / "Vanna" Vibe --- */}
      <div style={styles.visualSection}>
        <div style={styles.visualContent}>
          <h2 style={styles.visualHeading}>Chat with your Database</h2>
          <p style={styles.visualText}>
            Turn natural language into SQL queries instantly. 
            Secure, fast, and accurate analysis for your business data.
          </p>
          
          {/* Abstract UI Representation */}
          <div style={styles.codeCard}>
            <div style={styles.codeLine}><span style={{color:'#c678dd'}}>SELECT</span> * <span style={{color:'#c678dd'}}>FROM</span> sales</div>
            <div style={styles.codeLine}><span style={{color:'#c678dd'}}>WHERE</span> date &gt; <span style={{color:'#98c379'}}>'2024-01-01'</span></div>
            <div style={styles.codeLine}><span style={{color:'#c678dd'}}>ORDER BY</span> revenue <span style={{color:'#c678dd'}}>DESC</span>;</div>
            <div style={styles.chartPlaceholder}>
               <div style={{...styles.bar, height: '40%'}}></div>
               <div style={{...styles.bar, height: '70%'}}></div>
               <div style={{...styles.bar, height: '50%'}}></div>
               <div style={{...styles.bar, height: '90%'}}></div>
            </div>
          </div>
        </div>
        
        {/* Background Gradient Mesh */}
        <div style={styles.gradientMesh}></div>
      </div>

    </div>
  );
};

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    background: '#ffffff',
  },
  
  // --- Left Side ---
  formSection: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    position: 'relative',
    background: '#ffffff',
    zIndex: 2,
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '3rem',
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    background: 'black',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
  },
  brandName: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#000',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem',
    letterSpacing: '-1px',
  },
  subHeading: {
    color: '#6b7280',
    fontSize: '1rem',
    marginBottom: '2rem',
  },
  errorMessage: {
    background: '#fef2f2',
    color: '#991b1b',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    border: '1px solid #fee2e2',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.2s',
    background: '#f9fafb',
    color: '#111827',
  },
  button: {
    marginTop: '1rem',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    background: '#000000', // Vanna often uses stark black/white contrast
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonDisabled: {
    marginTop: '1rem',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    background: '#9ca3af',
    color: 'white',
    cursor: 'not-allowed',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '2rem',
    color: '#6b7280',
    fontSize: '0.9rem',
  },
  link: {
    color: '#000',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  devFooter: {
    marginTop: '4rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#9ca3af',
  },

  // --- Right Side (The "Vanna" Look) ---
  visualSection: {
    flex: '1.2',
    background: '#0f172a', // Dark slate background
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '4rem',
    color: 'white',
    overflow: 'hidden',
  },
  visualContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '500px',
  },
  visualHeading: {
    fontSize: '2.5rem',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '1.5rem',
    background: 'linear-gradient(to right, #ffffff, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  visualText: {
    fontSize: '1.1rem',
    color: '#cbd5e1',
    lineHeight: '1.6',
    marginBottom: '3rem',
  },
  
  // Abstract Code Card
  codeCard: {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid rgba(255,255,255,0.1)',
    fontFamily: "'Fira Code', monospace",
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  codeLine: {
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    color: '#e2e8f0',
  },
  chartPlaceholder: {
    marginTop: '1.5rem',
    height: '60px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    borderBottom: '1px solid #475569',
    paddingBottom: '5px',
  },
  bar: {
    flex: 1,
    background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
    borderRadius: '2px 2px 0 0',
    opacity: 0.8,
  },
  gradientMesh: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'radial-gradient(circle at top right, rgba(59,130,246,0.3), transparent 40%), radial-gradient(circle at bottom left, rgba(139,92,246,0.3), transparent 40%)',
    zIndex: 1,
  }
};

export default Login;