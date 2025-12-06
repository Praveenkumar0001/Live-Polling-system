import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS } from '../../utils/constants';
import FloatingChatButton from '../Shared/FloatingChatButton';
import ChatPanel from '../Shared/ChatPanel';
import '../../styles/TeacherPollHistory.css';

const TeacherPollHistory = () => {
  const navigate = useNavigate();
  const { emit, on } = useSocket();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!userId || userRole !== 'teacher') {
      navigate('/teacher/welcome');
      return;
    }

    // Request history data
    emit(SOCKET_EVENTS.HISTORY_GET);

    // Listen for history data
    const cleanup = on(SOCKET_EVENTS.HISTORY_DATA, (historyData) => {
      console.log('History received:', historyData);
      setHistory(historyData);
      setLoading(false);
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [navigate, emit, on]);

  const handleBack = () => {
    navigate('/teacher/results');
  };

  return (
    <div className="poll-history-page">
      {/* Back Button */}
      <button className="btn-back" onClick={handleBack}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Results
      </button>

      <div className="history-page-content">
        {/* Page Header */}
        <div className="history-page-header">
          <h1>
            View <span className="header-bold">Poll History</span>
          </h1>
        </div>

        {/* History Content */}
        <div className="history-page-list">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="no-history">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="30" stroke="#E5E7EB" strokeWidth="4"/>
                <path d="M32 20V34L40 40" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <p>No poll history available yet.</p>
              <span>Create and ask questions to build your poll history.</span>
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={item.questionId} className="history-item">
                <div className="history-item-header">
                  <h3>Question {item.questionNumber || idx + 1}</h3>
                  {item.askedAt && (
                    <span className="history-date">
                      {new Date(item.askedAt).toLocaleString()}
                    </span>
                  )}
                </div>
                
                <div className="history-question-card">
                  <div className="question-text-bar">
                    {item.questionText}
                  </div>

                  <div className="history-results-list">
                    {item.results.options.map((option, index) => (
                      <div key={index} className="history-result-item">
                        {/* Progress Bar Fill */}
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
                          <span className="result-percentage">{option.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
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

export default TeacherPollHistory;