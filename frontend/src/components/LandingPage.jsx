import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { ROLES } from '../utils/constants';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();
  const { connected, socket } = useSocket();

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    if (!connected) {
      alert('Not connected to server. Please wait.');
      return;
    }

    sessionStorage.clear();
    
    if (selectedRole === ROLES.STUDENT) {
      navigate('/student/enter-name');
    } else if (selectedRole === ROLES.TEACHER) {
      navigate('/teacher/join');
    }
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="brand-badge-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" fill="white"/>
          </svg>
          <span>Intervue Poll</span>
        </div>

        <h1 className="landing-title">Welcome to the Live Polling System</h1>
        <p className="landing-subtitle">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="role-options">
          <div 
            className={`role-card ${selectedRole === ROLES.STUDENT ? 'selected' : ''}`}
            onClick={() => setSelectedRole(ROLES.STUDENT)}
          >
            <h3>I'm a Student</h3>
            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
          </div>

          <div 
            className={`role-card ${selectedRole === ROLES.TEACHER ? 'selected' : ''}`}
            onClick={() => setSelectedRole(ROLES.TEACHER)}
          >
            <h3>I'm a Teacher</h3>
            <p>Submit answers and view live poll results in real-time.</p>
          </div>
        </div>

        <button 
          className="btn-continue"
          onClick={handleContinue}
          disabled={!selectedRole || !connected}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LandingPage;