import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS, UI_MESSAGES } from '../../utils/constants';
import '../../styles/StudentWaiting.css';
import FloatingChatButton from '../Shared/FloatingChatButton';
import ChatPanel from '../Shared/ChatPanel';

const StudentWaiting = () => {
  const navigate = useNavigate();
  const { on } = useSocket();
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      navigate('/student/enter-name');
      return;
    }

    // Listen for new question
    const cleanupQuestion = on(SOCKET_EVENTS.QUESTION_NEW, (question) => {
      console.log('New question received:', question);
      
      // Store question in sessionStorage
      sessionStorage.setItem('currentQuestion', JSON.stringify(question));
      
      // Navigate to question screen
      navigate('/student/question');
    });

    // Listen for kicked event
    const cleanupKicked = on(SOCKET_EVENTS.USER_KICKED, () => {
      console.log('Student was kicked');
      sessionStorage.clear();
      navigate('/student/kicked');
    });

    return () => {
      if (cleanupQuestion) cleanupQuestion();
      if (cleanupKicked) cleanupKicked();
    };
  }, [navigate, on]);

  return (
    <div className="student-waiting">
      <div className="waiting-container">
        <div className="brand-badge">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" fill="white"/>
          </svg>
          <span>Intervue Poll</span>
        </div>

        <div className="waiting-content">
          <div className="waiting-icon">
            <div className="pulse-ring"></div>
            <div className="pulse-ring delay-1"></div>
            <div className="pulse-ring delay-2"></div>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="28" stroke="#7C3AED" strokeWidth="4"/>
              <path d="M30 18V32L38 38" stroke="#7C3AED" strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          <h2>{UI_MESSAGES.WAIT_TEACHER}</h2>
        </div>
      </div>
      
      <FloatingChatButton onClick={() => setShowChat(true)} />

      {showChat && (
        <ChatPanel
          onClose={() => setShowChat(false)}
          isTeacher={false}
        />
      )}
    </div>
  );
};

export default StudentWaiting;