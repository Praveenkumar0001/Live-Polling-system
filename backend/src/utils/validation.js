/**
 * Validation utilities for Live Polling System
 */

const validateUserJoin = (data) => {
  if (!data) {
    return 'User data is required';
  }

  if (!data.name || typeof data.name !== 'string') {
    return 'Name is required and must be a string';
  }

  if (data.name.trim().length === 0) {
    return 'Name cannot be empty';
  }

  if (data.name.length > 50) {
    return 'Name is too long (max 50 characters)';
  }

  if (!data.role || !['student', 'teacher'].includes(data.role)) {
    return 'Role must be either "student" or "teacher"';
  }

  return null;
};

const validateQuestionCreate = (data) => {
  if (!data) {
    return 'Question data is required';
  }

  if (!data.text || typeof data.text !== 'string') {
    return 'Question text is required and must be a string';
  }

  if (data.text.trim().length === 0) {
    return 'Question text cannot be empty';
  }

  if (data.text.length > 500) {
    return 'Question text is too long (max 500 characters)';
  }

  if (!Array.isArray(data.options)) {
    return 'Options must be an array';
  }

  if (data.options.length < 2) {
    return 'Question must have at least 2 options';
  }

  if (data.options.length > 6) {
    return 'Question cannot have more than 6 options';
  }

  for (let i = 0; i < data.options.length; i++) {
    const option = data.options[i];
    
    if (!option.text || typeof option.text !== 'string') {
      return `Option ${i + 1} must have text`;
    }

    if (option.text.trim().length === 0) {
      return `Option ${i + 1} text cannot be empty`;
    }

    if (option.text.length > 200) {
      return `Option ${i + 1} text is too long (max 200 characters)`;
    }
  }

  if (data.duration !== undefined) {
    if (typeof data.duration !== 'number' || data.duration < 10 || data.duration > 300) {
      return 'Duration must be between 10 and 300 seconds';
    }
  }

  return null;
};

const validateAnswer = (data) => {
  if (!data) {
    return 'Answer data is required';
  }

  if (!data.questionId || typeof data.questionId !== 'string') {
    return 'Question ID is required';
  }

  if (typeof data.optionIndex !== 'number') {
    return 'Option index is required and must be a number';
  }

  if (data.optionIndex < 0) {
    return 'Option index must be non-negative';
  }

  return null;
};

const validateChatMessage = (data) => {
  if (!data) {
    return 'Message data is required';
  }

  if (!data.text || typeof data.text !== 'string') {
    return 'Message text is required and must be a string';
  }

  if (data.text.trim().length === 0) {
    return 'Message cannot be empty';
  }

  if (data.text.length > 500) {
    return 'Message is too long (max 500 characters)';
  }

  return null;
};

module.exports = {
  validateUserJoin,
  validateQuestionCreate,
  validateAnswer,
  validateChatMessage
};