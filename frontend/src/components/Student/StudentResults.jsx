import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS, formatTime, UI_MESSAGES } from '../../utils/constants';
import FloatingChatButton from '../Shared/FloatingChatButton';
import ChatPanel from '../Shared/ChatPanel';
import '../../styles/StudentResults.css';

const StudentResults = () => {
  const navigate = useNavigate();
  const { on } = useSocket();
  
  const [question, setQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Check authentication
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.warn('Not authenticated');
      navigate('/student/enter-name');
      return;
    }

    // Load question and results from sessionStorage
    const questionData = sessionStorage.getItem('currentQuestion');
    const resultsData = sessionStorage.getItem('currentResults');

    console.log('=== StudentResults Mount ===');
    console.log('Question data:', questionData);
    console.log('Results data:', resultsData);

    if (!questionData) {
      console.warn('No question data, redirecting to waiting');
      navigate('/student/waiting');
      return;
    }

    const parsedQuestion = JSON.parse(questionData);
    setQuestion(parsedQuestion);
    console.log('Parsed question:', parsedQuestion);

    if (resultsData) {
      const parsedResults = JSON.parse(resultsData);
      console.log('Parsed results:', parsedResults);
      setResults(parsedResults);
    } else {
      // Create initial empty results
      const initialResults = {
        questionId: parsedQuestion.id,
        questionText: parsedQuestion.text,
        options: parsedQuestion.options.map(opt => ({
          text: opt.text,
          votes: 0,
          percentage: 0,
          isCorrect: opt.isCorrect
        })),
        totalAnswers: 0,
        totalStudents: 0
      };
      setResults(initialResults);
    }

    // Listen for updated results
    const cleanupResults = on(SOCKET_EVENTS.QUESTION_RESULTS, (updatedResults) => {
      console.log('📊 Student received updated results:', updatedResults);
      setResults(updatedResults);
      sessionStorage.setItem('currentResults', JSON.stringify(updatedResults));
    });

    // Listen for new question
    const cleanupNewQuestion = on(SOCKET_EVENTS.QUESTION_NEW, (newQuestion) => {
      console.log('📝 Received new question:', newQuestion);
      sessionStorage.setItem('currentQuestion', JSON.stringify(newQuestion));
      sessionStorage.removeItem('currentResults');
      navigate('/student/question');
    });

    // Listen for kicked event
    const cleanupKicked = on(SOCKET_EVENTS.USER_KICKED, () => {
      console.log('👢 User was kicked');
      sessionStorage.clear();
      navigate('/student/kicked');
    });

    return () => {
      if (cleanupResults) cleanupResults();
      if (cleanupNewQuestion) cleanupNewQuestion();
      if (cleanupKicked) cleanupKicked();
    };
  }, [navigate, on]);

  if (!question) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  console.log('Rendering StudentResults - Results:', results);

  return (
    <div className="student-results">
      <div className="results-container">
        <div className="results-header-bar">
          <span className="question-number">Question 1</span>
          <div className="timer-badge frozen">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{formatTime(question.duration || 60)}</span>
          </div>
        </div>

        <div className="results-content-card card">
          <div className="question-text-bar">
            {question.text}
          </div>

          {results && results.options && results.options.length > 0 ? (
            <div className="results-list">
              {results.options.map((option, index) => {
                console.log(`Rendering option ${index}:`, option);
                const percentage = option.percentage || 0;
                
                return (
                  <div 
                    key={index} 
                    className="result-item"
                    data-percentage={`${percentage}%`}
                    style={{ '--percentage': `${percentage}%` }}
                  >
                    <div className="result-label">
                      <div className="option-number">{index + 1}</div>
                      <span className="option-text">{option.text}</span>
                    </div>
                    <div className="result-percentage">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="results-list">
              <div style={{ 
                padding: '2rem', 
                textAlign: 'center', 
                color: '#6B7280',
                fontSize: '0.9375rem'
              }}>
                <div className="spinner" style={{ margin: '0 auto 1rem', width: '32px', height: '32px' }}></div>
                Waiting for results...
              </div>
            </div>
          )}
        </div>

        <div className="waiting-message">
          {UI_MESSAGES.WAIT_NEW_QUESTION}
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

export default StudentResults;