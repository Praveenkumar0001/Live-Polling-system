import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { waitForSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS, ROLES } from '../../utils/constants';

const TeacherJoin = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Initializing...');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const joinAttemptedRef = useRef(false);

  const addLog = (msg) => {
    console.log(msg);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    if (joinAttemptedRef.current) return;

    addLog('Waiting for socket to initialize...');
    
    waitForSocket()
      .then((socket) => {
        addLog(`Socket ready: ${socket.id}`);
        addLog(`Socket connected: ${socket.connected}`);
        
        if (joinAttemptedRef.current) return;
        joinAttemptedRef.current = true;
        
        performJoin(socket);
      })
      .catch((err) => {
        addLog(`Failed to initialize socket: ${err.message}`);
        setError('Failed to connect to server');
      });
  }, []);

  const performJoin = (socket) => {
    addLog('=== STARTING JOIN ===');
    addLog(`Socket ID: ${socket.id}`);
    setStatus('Joining as teacher...');

    let completed = false;

    const handleJoined = (data) => {
      if (completed) return;
      completed = true;

      addLog('✅ RECEIVED user:joined');
      addLog(`User ID: ${data.userId}`);
      addLog(`Role: ${data.role}`);

      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('userName', data.name);
      sessionStorage.setItem('userRole', data.role);
      sessionStorage.setItem('socketId', socket.id);

      addLog('✅ Session data saved');
      setStatus('Success!');

      setTimeout(() => {
        navigate('/teacher/create-question', { replace: true });
      }, 500);
    };

    const handleError = (err) => {
      if (completed) return;
      completed = true;

      addLog(`❌ Error: ${err.message || 'Unknown'}`);
      setError(err.message || 'Join failed');
      setStatus('Failed');
    };

    const timeout = setTimeout(() => {
      if (!completed) {
        completed = true;
        addLog('❌ TIMEOUT');
        setError('No response from server');
        setStatus('Timeout');
      }
    }, 8000);

    socket.once('user:joined', handleJoined);
    socket.once('error', handleError);

    const joinData = {
      name: 'Teacher',
      role: ROLES.TEACHER
    };

    addLog(`📤 Emitting USER:JOIN`);
    socket.emit('user:join', joinData);
    addLog('✅ Emitted');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        maxWidth: '700px',
        width: '100%'
      }}>
        {!error ? (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <h2>{status}</h2>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#FEE2E2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '2rem'
            }}>
              ❌
            </div>
            <h2 style={{ color: '#EF4444' }}>Failed to Join</h2>
            <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <button 
                className="btn-primary"
                onClick={() => window.location.reload()}
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Retry
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  sessionStorage.clear();
                  navigate('/', { replace: true });
                }}
                style={{ padding: '0.75rem 1.5rem' }}
              >
                Go Back
              </button>
            </div>
          </div>
        )}

        {/* Debug Logs */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#F3F4F6',
          borderRadius: '8px',
          maxHeight: '350px',
          overflow: 'auto',
          fontSize: '0.7rem',
          fontFamily: 'monospace',
          color: '#374151'
        }}>
          <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Debug Log:</strong>
          {logs.map((log, i) => (
            <div key={i} style={{ 
              padding: '0.25rem 0', 
              borderBottom: '1px solid #E5E7EB',
              wordBreak: 'break-word'
            }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherJoin;