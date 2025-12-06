import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { SOCKET_EVENTS, formatTimestamp, UI_MESSAGES } from '../../utils/constants';
import ParticipantsPanel from './ParticipantsPanel';
import '../../styles/ChatPanel.css';

const ChatPanel = ({ onClose, isTeacher }) => {
  const { emit, on } = useSocket();
  const [activeTab, setActiveTab] = useState('chat');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Listen for chat messages
    const cleanupMessage = on(SOCKET_EVENTS.CHAT_MESSAGE, (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for chat history
    const cleanupHistory = on(SOCKET_EVENTS.CHAT_HISTORY, (history) => {
      setMessages(history);
    });

    // Listen for participants updates
    const cleanupParticipants = on(SOCKET_EVENTS.PARTICIPANTS_UPDATE, (participantsList) => {
      setParticipants(participantsList);
    });

    return () => {
      if (cleanupMessage) cleanupMessage();
      if (cleanupHistory) cleanupHistory();
      if (cleanupParticipants) cleanupParticipants();
    };
  }, [on]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      emit(SOCKET_EVENTS.CHAT_MESSAGE, { text: messageText.trim() });
      setMessageText('');
    }
  };

  const handleKickParticipant = (userId) => {
    if (window.confirm('Are you sure you want to kick this student?')) {
      emit(SOCKET_EVENTS.PARTICIPANT_KICK, { userId });
    }
  };

  return (
    <div className="chat-panel-overlay" onClick={onClose}>
      <div className="chat-panel card" onClick={(e) => e.stopPropagation()}>
        <div className="chat-panel-header">
          <div className="chat-tabs">
            <button
              className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              Chat
            </button>
            <button
              className={`chat-tab ${activeTab === 'participants' ? 'active' : ''}`}
              onClick={() => setActiveTab('participants')}
            >
              Participants
              <span className="participant-count">
                {participants.filter(p => p.role === 'student').length}
              </span>
            </button>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="chat-panel-content">
          {activeTab === 'chat' ? (
            <>
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M40 4H8C5.8 4 4 5.8 4 8V44L12 36H40C42.2 36 44 34.2 44 32V8C44 5.8 42.2 4 40 4Z" stroke="#9CA3AF" strokeWidth="3"/>
                    </svg>
                    <p>{UI_MESSAGES.NO_MESSAGES}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="chat-message">
                      <div className="message-header">
                        <span className="message-user">{msg.userName}</span>
                        <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                      <div className="message-text">{msg.text}</div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={500}
                  autoFocus
                />
                <button type="submit" disabled={!messageText.trim()} aria-label="Send message">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10L18 2L10 18L9 11L2 10Z" fill="currentColor"/>
                  </svg>
                </button>
              </form>
            </>
          ) : (
            <ParticipantsPanel
              participants={participants}
              isTeacher={isTeacher}
              onKickParticipant={handleKickParticipant}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;