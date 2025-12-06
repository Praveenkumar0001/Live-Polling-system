import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { waitForSocket } from '../../hooks/useSocket';
import { 
  SOCKET_EVENTS, 
  QUESTION_CONFIG, 
  validateQuestion, 
  validateOption 
} from '../../utils/constants';
import '../../styles/TeacherCreateQuestion.css';

const TeacherCreateQuestion = () => {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [duration, setDuration] = useState(QUESTION_CONFIG.DEFAULT_DURATION);
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Verify authentication
    const userId = sessionStorage.getItem('userId');
    const userRole = sessionStorage.getItem('userRole');

    if (!userId || userRole !== 'teacher') {
      navigate('/teacher/join', { replace: true });
      return;
    }

    // Get socket instance
    waitForSocket().then((sock) => {
      console.log('Socket ready in create question:', sock.id);
      setSocket(sock);

      // Listen for events
      const handleQuestionNew = (question) => {
        console.log('✅ Question created:', question);
        sessionStorage.setItem('currentQuestion', JSON.stringify(question));
        setIsSubmitting(false);
        navigate('/teacher/results');
      };

      const handleError = (error) => {
        console.error('❌ Error:', error);
        setErrors({ submit: error.message });
        setIsSubmitting(false);
      };

      sock.on('question:new', handleQuestionNew);
      sock.on('error', handleError);

      return () => {
        sock.off('question:new', handleQuestionNew);
        sock.off('error', handleError);
      };
    });
  }, [navigate]);

  const handleAddOption = () => {
    if (options.length < QUESTION_CONFIG.MAX_OPTIONS) {
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > QUESTION_CONFIG.MIN_OPTIONS) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index, text) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
    
    const newErrors = { ...errors };
    delete newErrors[`option${index}`];
    setErrors(newErrors);
  };

  const handleCorrectToggle = (index, isCorrect) => {
    const newOptions = [...options];
    newOptions[index].isCorrect = isCorrect;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!socket || !socket.connected) {
      setErrors({ submit: 'Not connected to server' });
      return;
    }

    console.log('=== SUBMIT QUESTION ===');
    console.log('Socket ID:', socket.id);
    
    // Validate
    const questionError = validateQuestion(questionText);
    if (questionError) {
      setErrors({ question: questionError });
      return;
    }

    const newErrors = {};
    const validOptions = [];

    options.forEach((option, index) => {
      if (option.text.trim()) {
        const optionError = validateOption(option.text);
        if (optionError) {
          newErrors[`option${index}`] = optionError;
        } else {
          validOptions.push({
            text: option.text.trim(),
            isCorrect: option.isCorrect
          });
        }
      }
    });

    if (validOptions.length < QUESTION_CONFIG.MIN_OPTIONS) {
      setErrors({ options: `At least ${QUESTION_CONFIG.MIN_OPTIONS} options required` });
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const questionData = {
      text: questionText.trim(),
      options: validOptions,
      duration
    };

    console.log('📤 Emitting QUESTION:CREATE');
    socket.emit('question:create', questionData);
  };

  if (!socket) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FAFAFA'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-create-question">
      <div className="create-question-container">
        <div className="brand-badge">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" fill="white"/>
          </svg>
          <span>Intervue Poll</span>
        </div>

        <h1 className="create-title">Let's Get Started</h1>
        <p className="create-subtitle">
          you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
        </p>

        {!socket.connected && (
          <div className="error-message" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}>
            ⚠️ Not connected. Reconnecting...
          </div>
        )}

        {errors.submit && (
          <div className="error-message">
            ❌ {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="question-form">
          <div className="question-input-group">
            <div className="question-header-row">
              <label>Enter your question</label>
              <div className="duration-selector">
                <select 
                  value={duration} 
                  onChange={(e) => setDuration(Number(e.target.value))}
                  disabled={isSubmitting}
                >
                  <option value={30}>30 seconds</option>
                  <option value={60}>60 seconds</option>
                  <option value={90}>90 seconds</option>
                  <option value={120}>120 seconds</option>
                </select>
              </div>
            </div>
            <textarea
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                const newErrors = { ...errors };
                delete newErrors.question;
                setErrors(newErrors);
              }}
              placeholder="Rahul Bajaj"
              maxLength={QUESTION_CONFIG.MAX_QUESTION_LENGTH}
              rows={4}
              disabled={isSubmitting || !socket.connected}
            />
            {errors.question && <span className="field-error">{errors.question}</span>}
            <div className="char-counter">{questionText.length}/100</div>
          </div>

          <div className="options-section">
            <div className="options-header">
              <h3>Edit Options</h3>
            </div>

            {errors.options && <div className="error-message">❌ {errors.options}</div>}

            <div className="options-list-create">
              {options.map((option, index) => (
                <div key={index} className="option-row">
                  <div className="option-input-wrapper">
                    <div className="option-input-group">
                      <div className="option-number">{index + 1}</div>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder="Rahul Bajaj"
                        maxLength={QUESTION_CONFIG.MAX_OPTION_LENGTH}
                        disabled={isSubmitting || !socket.connected}
                      />
                      {options.length > QUESTION_CONFIG.MIN_OPTIONS && (
                        <button
                          type="button"
                          className="btn-remove-option"
                          onClick={() => handleRemoveOption(index)}
                          disabled={isSubmitting}
                          title="Remove option"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    {errors[`option${index}`] && <span className="field-error">{errors[`option${index}`]}</span>}
                  </div>
                  
                  <div className="correct-toggle">
                    <span className="toggle-label">Is it Correct?</span>
                    <div className="toggle-buttons">
                      <div className="toggle-option">
                        <button
                          type="button"
                          className={`toggle-btn ${option.isCorrect ? 'active' : ''}`}
                          onClick={() => handleCorrectToggle(index, true)}
                          disabled={isSubmitting}
                          aria-label="Yes"
                        />
                        <label>Yes</label>
                      </div>
                      <div className="toggle-option">
                        <button
                          type="button"
                          className={`toggle-btn ${!option.isCorrect ? 'active' : ''}`}
                          onClick={() => handleCorrectToggle(index, false)}
                          disabled={isSubmitting}
                          aria-label="No"
                        />
                        <label>No</label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              type="button" 
              className="btn-add-option"
              onClick={handleAddOption}
              disabled={options.length >= QUESTION_CONFIG.MAX_OPTIONS || isSubmitting}
            >
              + Add More option
            </button>
          </div>

          <button 
            type="submit" 
            className="btn-ask-question"
            disabled={isSubmitting || !socket.connected}
          >
            {isSubmitting ? 'Creating Question...' : 'Ask Question'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherCreateQuestion;