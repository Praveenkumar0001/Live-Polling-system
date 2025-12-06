import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS, formatTime } from '../../utils/constants';
import '../../styles/StudentQuestion.css';
import FloatingChatButton from '../Shared/FloatingChatButton';
import ChatPanel from '../Shared/ChatPanel';

const StudentQuestion = () => {
  const navigate = useNavigate();
  const { emit, on } = useSocket();
  
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const questionData = sessionStorage.getItem('currentQuestion');
    console.log('StudentQuestion - Question data:', questionData);

    if (!questionData) {
      navigate('/student/waiting');
      return;
    }

    const parsedQuestion = JSON.parse(questionData);
    setQuestion(parsedQuestion);
    setTimeRemaining(parsedQuestion.duration || 60);

    // Listen for answer confirmation
    const cleanupAnswered = on(SOCKET_EVENTS.ANSWER_SUBMITTED, (data) => {
      console.log('✅ Answer confirmed:', data);
      setHasAnswered(true);
    });

    // Listen for results
    const cleanupResults = on(SOCKET_EVENTS.QUESTION_RESULTS, (results) => {
      console.log('📊 Results received:', results);
      sessionStorage.setItem('currentResults', JSON.stringify(results));
      
      // Navigate to results if answered
      if (hasAnswered) {
        setTimeout(() => {
          navigate('/student/results');
        }, 500);
      }
    });

    // Listen for expired
    const cleanupExpired = on(SOCKET_EVENTS.QUESTION_EXPIRED, () => {
      console.log('⏱️ Question expired');
      setTimeRemaining(0);
      
      // Navigate even if not answered
      setTimeout(() => {
        navigate('/student/results');
      }, 1000);
    });

    // Listen for kicked
    const cleanupKicked = on(SOCKET_EVENTS.USER_KICKED, () => {
      sessionStorage.clear();
      navigate('/student/kicked');
    });

    return () => {
      if (cleanupAnswered) cleanupAnswered();
      if (cleanupResults) cleanupResults();
      if (cleanupExpired) cleanupExpired();
      if (cleanupKicked) cleanupKicked();
    };
  }, [navigate, on, emit, hasAnswered]);

  // Timer
  useEffect(() => {
    if (timeRemaining > 0 && !hasAnswered) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, hasAnswered]);

  const handleSubmit = () => {
    if (selectedOption === null || hasAnswered || !question) {
      return;
    }

    console.log('📤 Submitting answer:', {
      questionId: question.id,
      optionIndex: selectedOption
    });

    emit(SOCKET_EVENTS.ANSWER_SUBMIT, {
      questionId: question.id,
      optionIndex: selectedOption
    });

    setHasAnswered(true);
  };

  if (!question) {
    return <div className="loading-screen">Loading question...</div>;
  }

  return (
    <div className="student-question">
      <div className="question-container">
        <div className="question-header-bar">
          <span className="question-number">Question 1</span>
          <div className={`timer-badge ${timeRemaining <= 10 ? 'warning' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="question-content-card card">
          <div className="question-text-bar">
            {question.text}
          </div>

          <div className="options-list">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`option-item ${selectedOption === index ? 'selected' : ''} ${hasAnswered ? 'disabled' : ''}`}
                onClick={() => !hasAnswered && setSelectedOption(index)}
                role="button"
                tabIndex={hasAnswered ? -1 : 0}
              >
                <div className="option-number">{index + 1}</div>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
          </div>

          <button
            className="btn-submit btn-primary"
            onClick={handleSubmit}
            disabled={selectedOption === null || hasAnswered}
          >
            {hasAnswered ? 'Answer Submitted' : 'Submit'}
          </button>
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

export default StudentQuestion;