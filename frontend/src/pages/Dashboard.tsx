import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface User {
  email: string;
  full_name: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload-schema', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // The backend returns { msg: "...", id: ... } so we use res.data.msg
      setMessage(`✅ Success: ${res.data.msg}`);
      setFile(null); // Clear file after success
    } catch (err) {
      setMessage('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) return (
    <div style={styles.loadingContainer}>
      <div style={styles.spinner}></div>
    </div>
  );

  return (
    <div style={styles.container}>
      
      {/* --- Navbar / Header --- */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>📊 AI Analyst</div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main style={styles.main}>
        
        {/* Welcome Section */}
        <div style={styles.welcomeSection}>
          <h1 style={styles.greeting}>Welcome back, {user.full_name || 'User'}! 👋</h1>
          <p style={styles.subGreeting}>You are logged in as <span style={styles.emailHighlight}>{user.email}</span></p>
        </div>

        {/* Action Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>📂 Upload Database Schema</h2>
            <p style={styles.cardSubtitle}>Upload your <code>.sql</code> file to start analyzing your data.</p>
          </div>

          <div style={styles.uploadArea}>
            <input 
              type="file" 
              accept=".sql"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
              style={styles.fileInput}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={styles.fileLabel}>
              {file ? `📄 ${file.name}` : 'Click to Select SQL File'}
            </label>

            <button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              style={!file || uploading ? styles.uploadBtnDisabled : styles.uploadBtn}
            >
              {uploading ? 'Uploading...' : 'Upload & Process'}
            </button>
          </div>

          {message && (
            <div style={message.includes('Success') ? styles.successMsg : styles.errorMsg}>
              {message}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

// --- Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    fontFamily: "'Inter', sans-serif",
    color: '#333',
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f5f7fa',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e1e4e8',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite', // Note: You'd need global CSS for keyframes
  },
  navbar: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '1rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  navContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #ef4444',
    color: '#ef4444',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  main: {
    maxWidth: '800px',
    margin: '3rem auto',
    padding: '0 1.5rem',
  },
  welcomeSection: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  greeting: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#1f2937',
  },
  subGreeting: {
    color: '#6b7280',
    fontSize: '1.1rem',
  },
  emailHighlight: {
    color: '#2563eb',
    fontWeight: '500',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '2.5rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  cardHeader: {
    marginBottom: '2rem',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#111827',
  },
  cardSubtitle: {
    color: '#6b7280',
    fontSize: '0.95rem',
  },
  uploadArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    alignItems: 'center',
    padding: '2rem',
    border: '2px dashed #e5e7eb',
    borderRadius: '12px',
    background: '#f9fafb',
  },
  fileInput: {
    display: 'none', // Hide default ugly input
  },
  fileLabel: {
    padding: '12px 24px',
    background: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#374151',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'all 0.2s',
  },
  uploadBtn: {
    padding: '12px 32px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
    transition: 'background 0.2s',
  },
  uploadBtnDisabled: {
    padding: '12px 32px',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'not-allowed',
  },
  successMsg: {
    marginTop: '1.5rem',
    padding: '12px',
    background: '#dcfce7',
    color: '#166534',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorMsg: {
    marginTop: '1.5rem',
    padding: '12px',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: '500',
  },
};

export default Dashboard;