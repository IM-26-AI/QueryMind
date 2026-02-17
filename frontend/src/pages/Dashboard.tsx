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
  const [question, setQuestion] = useState('');
  const [querying, setQuerying] = useState(false);
  const [querySql, setQuerySql] = useState<string | null>(null);
  const [queryResults, setQueryResults] = useState<any[] | null>(null);
  const [querySummary, setQuerySummary] = useState<string | null>(null);
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
    const formData = new FormData();
    formData.append('file', file);

      try {
      const res = await api.post('/upload-schema', formData); // Updated endpoint to match backend
      setMessage(`✅ Success: ${res.data.msg || 'File uploaded'}`);
    } catch (err) {
      setMessage('❌ Upload failed. Please check the file.');
    }
  };

  const handleQuery = async () => {
    if (!question.trim()) return;
    setQuerying(true);
    setQuerySql(null);
    setQueryResults(null);
    setQuerySummary(null);

    try {
      const res = await api.post('/query', { question });
      const data = res.data;
      setQuerySql(data.sql_query || null);
      setQueryResults(Array.isArray(data.results) ? data.results : []);
      setQuerySummary(data.summary || null);
    } catch (err: any) {
      setMessage('❌ Query failed. Please try again.');
    } finally {
      setQuerying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) return <div style={styles.loading}>Loading interface...</div>;

  return (
    <div style={styles.pageContainer}>
      
      {/* --- Top Navigation --- */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>
           <span style={styles.logoIcon}>✨</span> QueryMind
        </div>
        <div style={styles.navUser}>
           <span style={styles.userName}>{user.full_name}</span>
           <button onClick={handleLogout} style={styles.logoutBtn}>Sign Out</button>
        </div>
      </nav>

      <div style={styles.mainContent}>
        
        {/* --- Section 1: The AI Analyst (Hero) --- */}
        <div style={styles.heroSection}>
          <h2 style={styles.heroTitle}>Ask your Data</h2>
          <p style={styles.heroSubtitle}>Generate SQL and insights instantly using natural language.</p>
          
          <div style={styles.queryBox}>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Show me the top 5 customers by total revenue in 2024..."
              style={styles.queryInput}
            />
            <div style={styles.queryActions}>
              <button 
                onClick={handleQuery} 
                disabled={querying} 
                style={querying ? styles.runBtnDisabled : styles.runBtn}
              >
                {querying ? 'Analyzing...' : '✨ Generate SQL & Run'}
              </button>
              <button 
                onClick={() => { setQuestion(''); setQuerySql(null); setQueryResults(null); setQuerySummary(null); }} 
                style={styles.clearBtn}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* --- Section 2: Results Display --- */}
        {(querySummary || querySql || queryResults) && (
          <div style={styles.resultsContainer}>
            
            {/* 2A. Summary Box */}
            {querySummary && (
              <div style={styles.summaryCard}>
                <div style={styles.cardHeader}>💡 AI Insight</div>
                <div style={styles.summaryText}>{querySummary}</div>
              </div>
            )}

            {/* 2B. SQL Code Block (Dark Mode style) */}
            {querySql && (
              <div style={styles.codeCard}>
                <div style={styles.cardHeaderCode}>
                  <span>SQL Query</span>
                  <span style={styles.langTag}>POSTGRESQL</span>
                </div>
                <pre style={styles.codeBlock}>{querySql}</pre>
              </div>
            )}

            {/* 2C. Data Table */}
            {queryResults && queryResults.length > 0 && (
              <div style={styles.tableCard}>
                <div style={styles.cardHeader}>📊 Query Results</div>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        {Object.keys(queryResults[0]).map((k) => (
                          <th key={k} style={styles.th}>{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.map((row, idx) => (
                        <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                          {Object.values(row).map((val, i) => (
                            <td key={i} style={styles.td}>{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- Section 3: Upload Utility (Bottom) --- */}
        <div style={styles.uploadSection}>
          <div style={styles.uploadCard}>
            <div style={styles.uploadHeader}>
              <h4 style={{margin:0}}>📂 Data Source</h4>
              <p style={{margin:'5px 0 0', fontSize:'0.85rem', color:'#666'}}>Update your database schema context.</p>
            </div>
            
            <div style={styles.uploadControls}>
              <label style={styles.fileLabel}>
                <input 
                  type="file" 
                  accept=".sql"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
                  style={{display: 'none'}}
                />
                {file ? `📄 ${file.name}` : 'Select SQL File'}
              </label>

              <button onClick={handleUpload} style={styles.uploadBtn}>Upload</button>
            </div>
            
            {message && <div style={message.includes('Success') ? styles.msgSuccess : styles.msgError}>{message}</div>}
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Modern "Vanna" Style System ---
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    background: '#f3f4f6', // Light gray background
    fontFamily: "'Inter', sans-serif",
    color: '#1f2937',
  },
  loading: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666'
  },
  
  // Navbar
  navbar: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    padding: '0.8rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  },
  navLogo: {
    fontSize: '1.25rem', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px'
  },
  logoIcon: { fontSize: '1.5rem' },
  navUser: { display: 'flex', alignItems: 'center', gap: '15px' },
  userName: { fontSize: '0.9rem', fontWeight: '500', color: '#374151' },
  logoutBtn: {
    padding: '6px 12px',
    fontSize: '0.85rem',
    color: '#ef4444',
    background: 'transparent',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },

  // Main Layout
  mainContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem',
  },

  // Hero / Query Section
  heroSection: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.5px'
  },
  heroSubtitle: { color: '#6b7280', fontSize: '1rem', marginBottom: '2rem' },
  
  queryBox: {
    background: '#ffffff',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.05)',
  },
  queryInput: {
    width: '100%',
    minHeight: '100px',
    padding: '1rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '1rem',
  },
  queryActions: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px'
  },
  runBtn: {
    padding: '10px 24px',
    background: '#000000', // Vanna black
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  runBtnDisabled: {
    padding: '10px 24px',
    background: '#9ca3af',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'not-allowed',
  },
  clearBtn: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#6b7280',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
  },

  // Results Section
  resultsContainer: {
    display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem'
  },
  
  // Summary Card
  summaryCard: {
    background: '#f0f9ff', // Light blue tint
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  summaryText: { fontSize: '1rem', lineHeight: '1.6', color: '#0c4a6e' },

  // SQL Code Card (Dark Mode)
  codeCard: {
    background: '#1e293b', // Slate 800
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  cardHeaderCode: {
    background: '#0f172a', // Slate 900
    color: '#cbd5e1',
    padding: '10px 20px',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #334155',
  },
  langTag: {
    fontSize: '0.7rem',
    background: '#334155',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#94a3b8',
  },
  codeBlock: {
    padding: '20px',
    color: '#e2e8f0', // Light code text
    fontFamily: "'Fira Code', 'Consolas', monospace",
    fontSize: '0.9rem',
    margin: 0,
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
  },

  // Table Card
  tableCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardHeader: {
    padding: '15px 20px',
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111827',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '12px 20px',
    background: '#f9fafb',
    color: '#374151',
    fontWeight: '600',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 20px',
    borderBottom: '1px solid #f3f4f6',
    color: '#4b5563',
  },
  trEven: { background: '#ffffff' },
  trOdd: { background: '#f9fafb' },

  // Upload Section
  uploadSection: {
    marginTop: '2rem',
  },
  uploadCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '2px dashed #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  uploadHeader: { flex: 1 },
  uploadControls: {
    display: 'flex', gap: '10px', alignItems: 'center'
  },
  fileLabel: {
    padding: '8px 16px',
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#374151',
    fontWeight: '500',
  },
  uploadBtn: {
    padding: '8px 20px',
    background: '#10b981', // Emerald Green
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  msgSuccess: {
    width: '100%', marginTop: '10px', padding: '10px', background: '#ecfdf5', color: '#047857', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid #a7f3d0'
  },
  msgError: {
    width: '100%', marginTop: '10px', padding: '10px', background: '#fef2f2', color: '#b91c1c', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid #fecaca'
  }
};

export default Dashboard;