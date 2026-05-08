import React, { useState, useEffect, useMemo } from 'react';

// Priority Weights configuration
const WEIGHTS = {
  placement: 3000,
  result: 2000,
  event: 1000,
};

const App = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = "http://4.224.186.213/evaluation-service/notifications";
  const API_TOKEN = "YOUR_ACTUAL_TOKEN_HERE";

  const fetchNotifications = async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const topTenNotifications = useMemo(() => {
    return notifications
      .map((notif) => {
        const typeKey = notif.type?.toLowerCase();
        const weight = WEIGHTS[typeKey] || 0;
        const score = (weight * 100000000000) + new Date(notif.timestamp).getTime();
        
        return { ...notif, priorityScore: score };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10);
  }, [notifications]);

  if (loading) return <div>Loading priority notifications...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Stage 1: Priority Inbox</h1>
      <p>Displaying the top 10 most important unread notifications.</p>
      
      <div style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
        {topTenNotifications.length > 0 ? (
          topTenNotifications.map((n, index) => (
            <div 
              key={n.id || index} 
              style={{ 
                padding: '15px', 
                borderBottom: '1px solid #eee',
                backgroundColor: index < 3 ? '#fff9c4' : 'transparent' // Highlight top 3
              }}
            >
              <strong style={{ color: '#d32f2f' }}>[{n.type.toUpperCase()}]</strong>
              <span style={{ marginLeft: '10px' }}>{n.message}</span>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Received: {new Date(n.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <p style={{ padding: '20px' }}>No notifications found.</p>
        )}
      </div>
    </div>
  );
};

export default App;