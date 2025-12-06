// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Log the URLs for debugging
console.log('API_URL:', API_URL);
console.log('SOCKET_URL:', SOCKET_URL);

// Rest of your constants...
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher'
};

export const QUESTION_CONFIG = {
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  DEFAULT_DURATION: 60,
  MIN_DURATION: 10,
  MAX_DURATION: 300,
  MAX_QUESTION_LENGTH: 500,
  MAX_OPTION_LENGTH: 200
};

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_MESSAGES_DISPLAY: 100
};

export const USER_CONFIG = {
  MAX_NAME_LENGTH: 50,
  MIN_NAME_LENGTH: 1
};

export const SOCKET_EVENTS = {
  USER_JOIN: 'user:join',
  USER_JOINED: 'user:joined',
  USER_KICKED: 'user:kicked',
  QUESTION_CREATE: 'question:create',
  QUESTION_NEW: 'question:new',
  QUESTION_EXPIRED: 'question:expired',
  QUESTION_CAN_ASK: 'question:canAsk',
  QUESTION_CAN_ASK_RESPONSE: 'question:canAskResponse',
  QUESTION_RESULTS: 'question:results',
  ANSWER_SUBMIT: 'answer:submit',
  ANSWER_SUBMITTED: 'answer:submitted',
  CHAT_MESSAGE: 'chat:message',
  CHAT_HISTORY: 'chat:history',
  PARTICIPANTS_UPDATE: 'participants:update',
  PARTICIPANT_KICK: 'participant:kick',
  HISTORY_GET: 'history:get',
  HISTORY_DATA: 'history:data',
  ERROR: 'error'
};

export const UI_MESSAGES = {
  CONNECTING: 'Connecting to server...',
  CONNECTED: 'Connected successfully',
  DISCONNECTED: 'Disconnected from server',
  WAIT_TEACHER: 'Wait for the teacher to ask questions..',
  WAIT_NEW_QUESTION: 'Wait for the teacher to ask a new question..',
  KICKED_OUT: 'You\'ve been Kicked out !',
  KICKED_OUT_DESC: 'Looks like the teacher had removed you from the poll system. Please try again sometime.',
  NO_MESSAGES: 'No messages yet. Start the conversation!',
  NO_PARTICIPANTS: 'No students connected yet.',
  NO_HISTORY: 'No poll history available yet.',
  ANSWER_SUBMITTED: 'Answer Submitted',
  SUBMIT: 'Submit'
};

export const COLORS = {
  PRIMARY: '#7C3AED',
  PRIMARY_HOVER: '#6D28D9',
  PRIMARY_LIGHT: '#A78BFA',
  DANGER: '#EF4444',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  INFO: '#3B82F6'
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Name cannot be empty';
  }
  if (name.length > USER_CONFIG.MAX_NAME_LENGTH) {
    return `Name is too long (max ${USER_CONFIG.MAX_NAME_LENGTH} characters)`;
  }
  return null;
};

export const validateQuestion = (text) => {
  if (!text || text.trim().length === 0) {
    return 'Question cannot be empty';
  }
  if (text.length > QUESTION_CONFIG.MAX_QUESTION_LENGTH) {
    return `Question is too long (max ${QUESTION_CONFIG.MAX_QUESTION_LENGTH} characters)`;
  }
  return null;
};

export const validateOption = (text) => {
  if (!text || text.trim().length === 0) {
    return 'Option cannot be empty';
  }
  if (text.length > QUESTION_CONFIG.MAX_OPTION_LENGTH) {
    return `Option is too long (max ${QUESTION_CONFIG.MAX_OPTION_LENGTH} characters)`;
  }
  return null;
};