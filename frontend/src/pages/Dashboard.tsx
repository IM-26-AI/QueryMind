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
      const res = await api.post('/upload_data', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Success: ${res.data.message}`);
    } catch (err) {
      setMessage('Upload failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;

  return (
    // 1. Main Background
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '2rem' }}>
      
      {/* 2. Centered Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
          <h1 style={{ margin: 0, color: '#333' }}>📊 Dashboard</h1>
          <button 
            onClick={handleLogout} 
            style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Logout
          </button>
        </header>

        {/* User Info */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: 0, color: '#555' }}>Welcome, {user.full_name}</h3>
          <p style={{ color: '#777', marginTop: '5px' }}>{user.email}</p>
        </div>

        {/* Upload Section */}
        <div style={{ background: '#f1f3f5', padding: '20px', borderRadius: '8px', border: '1px dashed #ced4da' }}>
          <h4 style={{ marginTop: 0 }}>📂 Upload Data</h4>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
              style={{ padding: '10px', background: 'white', borderRadius: '4px', border: '1px solid #ddd' }}
            />
            <button 
              onClick={handleUpload} 
              style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Upload File
            </button>
          </div>

          {message && (
            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '4px', background: message.includes('Success') ? '#d4edda' : '#f8d7da', color: message.includes('Success') ? '#155724' : '#721c24' }}>
              {message}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;