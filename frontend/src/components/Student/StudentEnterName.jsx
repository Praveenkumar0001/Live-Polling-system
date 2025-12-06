import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { ROLES, SOCKET_EVENTS, validateName } from '../../utils/constants';
import '../../styles/StudentEnterName.css';

const StudentEnterName = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { emit, on, connected } = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!connected) {
      setError('Not connected to server. Please wait...');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Listen for join confirmation
    const cleanup = on(SOCKET_EVENTS.USER_JOINED, (data) => {
      console.log('Student joined successfully:', data);
      
      // Store user data in sessionStorage
      sessionStorage.setItem('userId', data.userId);
      sessionStorage.setItem('userName', data.name);
      sessionStorage.setItem('userRole', data.role);
      
      // Navigate to waiting screen
      navigate('/student/waiting');
    });

    // Listen for errors
    const cleanupError = on(SOCKET_EVENTS.ERROR, (error) => {
      setError(error.message || 'Failed to join');
      setIsSubmitting(false);
    });

    // Emit join event
    emit(SOCKET_EVENTS.USER_JOIN, {
      name: name.trim(),
      role: ROLES.STUDENT
    });

    // Cleanup listeners after 5 seconds
    setTimeout(() => {
      if (cleanup) cleanup();
      if (cleanupError) cleanupError();
    }, 5000);
  };

  return (
    <div className="student-enter-name">
      <div className="enter-name-container">
        <div className="enter-name-card">
          {/* Brand Badge */}
          <div className="brand-badge-wrapper">
            <div className="brand-badge">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" fill="white"/>
              </svg>
              <span>Intervue Poll</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="enter-name-title">
            Let's <span className="title-bold">Get Started</span>
          </h1>

          {/* Subtitle */}
          <p className="enter-name-subtitle">
            If you're a student, you'll be able to <span className="subtitle-bold">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
          </p>

          {/* Connection Status */}
          {!connected && (
            <div className="connection-status warning">
              <span>⚠️ Connecting to server...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span>❌ {error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="enter-name-form">
            <div className="form-group">
              <label htmlFor="studentName" className="form-label">
                Enter your Name
              </label>
              <input
                type="text"
                id="studentName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                className="form-input"
                placeholder="Rahul Bajaj"
                maxLength={50}
                autoFocus
                disabled={isSubmitting || !connected}
              />
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={!name.trim() || isSubmitting || !connected}
            >
              {isSubmitting ? 'Joining...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentEnterName;