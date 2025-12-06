import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { ROLES, SOCKET_EVENTS } from '../../utils/constants';
import '../../styles/TeacherWelcome.css';

const TeacherWelcome = () => {
  const navigate = useNavigate();
  const { emit, on, connected } = useSocket();
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    // Check if already joined
    const existingUserId = sessionStorage.getItem('userId');
    const existingRole = sessionStorage.getItem('userRole');

    if (existingUserId && existingRole === 'teacher') {
      console.log('Already joined as teacher, navigating to create question');
      setTimeout(() => {
        navigate('/teacher/create-question');
      }, 1000);
      return;
    }

    if (!connected || hasJoined) {
      return;
    }

    console.log('Starting teacher join process...');
    setHasJoined(true);

    // Listen for join confirmation
    const cleanup = on(SOCKET_EVENTS.USER_JOINED, (data) => {
      console.log('Teacher joined successfully:', data);
      
      // Store user data in sessionStorage
      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('userName', data.name);
      sessionStorage.setItem('userRole', data.role);
      
      // Navigate to create question screen after a delay
      setTimeout(() => {
        navigate('/teacher/create-question');
      }, 1500);
    });

    // Listen for errors
    const cleanupError = on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('Join error:', error);
      alert('Failed to join: ' + error.message);
      setHasJoined(false);
    });

    // Emit join event
    console.log('Emitting teacher join...');
    emit(SOCKET_EVENTS.USER_JOIN, {
      name: 'Teacher',
      role: ROLES.TEACHER
    });

    return () => {
      if (cleanup) cleanup();
      if (cleanupError) cleanupError();
    };
  }, [connected, emit, on, navigate, hasJoined]);

  return (
    <div className="teacher-welcome">
      <div className="welcome-container card">
        <div className="brand-badge">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" fill="white"/>
          </svg>
          <span>Intervue Poll</span>
        </div>

        <h1 className="welcome-title">Let's Get Started</h1>
        <p className="welcome-subtitle">
          you'll have the ability to create and manage polls, ask questions, 
          and monitor your students' responses in real-time.
        </p>

        <div className="welcome-loading">
          <div className="spinner"></div>
          <p>
            {!connected ? 'Connecting to server...' : 'Setting up your polling session...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherWelcome;