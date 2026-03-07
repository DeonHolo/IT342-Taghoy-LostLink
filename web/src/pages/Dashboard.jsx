import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>LostLink</h1>
        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
      </header>
      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome, {user.firstName} {user.lastName}!</h2>
          <p>You are logged in as <strong>{user.role}</strong></p>
          <div className="user-details">
            <div className="detail-row">
              <span className="detail-label">Student ID</span>
              <span className="detail-value">{user.studentId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>
          </div>
          <p className="placeholder-note">
            🚧 The item feed and full dashboard will be implemented in later phases.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
