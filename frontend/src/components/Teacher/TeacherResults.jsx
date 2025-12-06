import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS } from '../../utils/constants';
import FloatingChatButton from '../Shared/FloatingChatButton';
import ChatPanel from '../Shared/ChatPanel';
import '../../styles/TeacherResults.css';

const TeacherResults = () => {
  const navigate = useNavigate();
  const { emit, on } = useSocket();

  const [question, setQuestion] = useState(null);
  const [results, setResults] = useState(null);
  const [canAskNew, setCanAskNew] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!userId || userRole !== 'teacher') {
      console.warn('Not authenticated as teacher');
      navigate('/teacher/join');
      return;
    }

    // Load question from sessionStorage
    const questionData = sessionStorage.getItem('currentQuestion');
    console.log('TeacherResults - Question data:', questionData);
    
    if (questionData) {
      const parsedQuestion = JSON.parse(questionData);
      setQuestion(parsedQuestion);
      
      // Immediately calculate initial results (all zeros)
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

    // Listen for results updates
    const cleanupResults = on(SOCKET_EVENTS.QUESTION_RESULTS, (updatedResults) => {
      console.log('📊 Teacher received results update:', updatedResults);
      setResults(updatedResults);
      
      // Check if all students have answered
      if (updatedResults.totalStudents > 0 && 
          updatedResults.totalAnswers >= updatedResults.totalStudents) {
        console.log('✅ All students answered, can ask new question');
        setCanAskNew(true);
      }
    });

    // Listen for question expired
    const cleanupExpired = on(SOCKET_EVENTS.QUESTION_EXPIRED, () => {
      console.log('⏱️ Question expired, can ask new question');
      setCanAskNew(true);
    });

    // Listen for can ask response
    const cleanupCanAsk = on(SOCKET_EVENTS.QUESTION_CAN_ASK_RESPONSE, (data) => {
      console.log('Can ask new question:', data.canAsk);
      setCanAskNew(data.canAsk);
    });

    // Request initial can ask status
    emit(SOCKET_EVENTS.QUESTION_CAN_ASK);

    return () => {
      if (cleanupResults) cleanupResults();
      if (cleanupExpired) cleanupExpired();
      if (cleanupCanAsk) cleanupCanAsk();
    };
  }, [navigate, emit, on]);

  const handleAskNewQuestion = () => {
    if (canAskNew) {
      console.log('Navigating to create new question');
      sessionStorage.removeItem('currentQuestion');
      sessionStorage.removeItem('currentResults');
      navigate('/teacher/create-question');
    } else {
      console.warn('Cannot ask new question yet');
    }
  };

  const handleViewHistory = () => {
    navigate('/teacher/poll-history');
  };

  if (!question) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading results...</p>
      </div>
    );
  }

  return (
    <div className="teacher-results">
      {/* View Poll History Button - Top Right */}
      <button 
        className="btn-view-history-top"
        onClick={handleViewHistory}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        View Poll history
      </button>

      <div className="results-main-content">
        {/* Question Header */}
        <div className="results-header">
          <h2 className="results-title">Question</h2>
          {results && (
            <p className="results-subtitle">
              {results.totalAnswers} / {results.totalStudents} students answered
            </p>
          )}
        </div>

        {/* Results Card */}
        <div className="results-card">
          {/* Question Text Bar */}
          <div className="question-text-bar">
            {question.text}
          </div>

          {/* Results List */}
          {results && results.options ? (
            <div className="results-list">
              {results.options.map((option, index) => {
                console.log(`Rendering option ${index}:`, option);
                return (
                  <div key={index} className="result-item">
                    {/* Progress Bar Background */}
                    <div 
                      className="result-bar-fill" 
                      style={{ width: `${option.percentage}%` }}
                    />
                    
                    {/* Content Overlay */}
                    <div className="result-content">
                      <div className="result-left">
                        <div className="option-number">{index + 1}</div>
                        <span className="option-text">{option.text}</span>
                      </div>
                      <div className="result-right">
                        <span className="result-votes">{option.votes} votes</span>
                        <span className="result-percentage">{option.percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="results-list">
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                Waiting for results...
              </div>
            </div>
          )}

          {/* Ask New Question Button */}
          <div className="results-actions">
            <button
              className={`btn-ask-new ${canAskNew ? '' : 'disabled'}`}
              onClick={handleAskNewQuestion}
              disabled={!canAskNew}
              title={!canAskNew ? "Wait for all students to answer or timer to expire" : "Ask a new question"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Ask a new question
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setShowChat(true)} />

      {/* Chat Panel */}
      {showChat && (
        <ChatPanel
          onClose={() => setShowChat(false)}
          isTeacher={true}
        />
      )}
    </div>
  );
};

export default TeacherResults;