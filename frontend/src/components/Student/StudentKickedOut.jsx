import { useEffect } from 'react';
import '../../styles/StudentKickedOut.css';

const StudentKickedOut = () => {
  useEffect(() => {
    // Clear all session data
    sessionStorage.clear();
  }, []);

  const handleRetry = () => {
    window.location.href = '/';
  };

  return (
    <div className="student-kicked-out">
      <div className="kicked-container">
        <div className="brand-badge">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" fill="white"/>
          </svg>
          <span>Intervue Poll</span>
        </div>

        <div className="kicked-content card">
          <div className="kicked-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" fill="#FEE2E2"/>
              <path d="M28 28L52 52M52 28L28 52" stroke="#EF4444" strokeWidth="6" strokeLinecap="round"/>
            </svg>
          </div>
          
          <h1>You've been Kicked out !</h1>
          <p>
            Looks like the teacher had removed you from the poll system. Please try again sometime.
          </p>

          <button className="btn-primary" onClick={handleRetry}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentKickedOut;