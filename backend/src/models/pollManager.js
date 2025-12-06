const { v4: uuidv4 } = require('uuid');

class PollManager {
  constructor() {
    this.participants = new Map(); // socketId -> participant
    this.currentQuestion = null;
    this.answers = new Map(); // questionId -> Map(userId -> optionIndex)
    this.questionHistory = [];
    this.chatMessages = [];
  }

  // Participant management
  addParticipant(socketId, name, role) {
    const participant = {
      id: uuidv4(),
      socketId,
      name,
      role,
      joinedAt: Date.now()
    };
    
    this.participants.set(socketId, participant);
    console.log(`[POLL_MANAGER] Added participant:`, participant);
    console.log(`[POLL_MANAGER] Total participants:`, this.participants.size);
    return participant;
  }

  getParticipant(socketId) {
    const participant = this.participants.get(socketId);
    console.log(`[POLL_MANAGER] getParticipant(${socketId}):`, participant || 'NOT FOUND');
    return participant;
  }

  getParticipantByUserId(userId) {
    for (const participant of this.participants.values()) {
      if (participant.id === userId) {
        return participant;
      }
    }
    return null;
  }

  removeParticipant(socketId) {
    const removed = this.participants.delete(socketId);
    console.log(`[POLL_MANAGER] Removed participant ${socketId}:`, removed);
    return removed;
  }

  getParticipantsList() {
    return Array.from(this.participants.values()).map(p => ({
      id: p.id,
      name: p.name,
      role: p.role
    }));
  }

  getStudentNames() {
    const names = [];
    for (const participant of this.participants.values()) {
      if (participant.role === 'student') {
        names.push(participant.name.toLowerCase());
      }
    }
    return names;
  }

  getStudents() {
    const students = [];
    for (const participant of this.participants.values()) {
      if (participant.role === 'student') {
        students.push(participant);
      }
    }
    return students;
  }

  // Question management
  createQuestion(questionData) {
    // Archive current question if exists
    if (this.currentQuestion) {
      const results = this.calculateResults(this.currentQuestion.id);
      this.questionHistory.push({
        ...this.currentQuestion,
        results,
        askedAt: this.currentQuestion.startTime,
        endedAt: Date.now()
      });
      console.log(`[POLL_MANAGER] Archived previous question`);
    }

    const questionId = uuidv4();
    this.currentQuestion = {
      id: questionId,
      text: questionData.text,
      options: questionData.options, // [{text, isCorrect}]
      duration: questionData.duration || 60,
      startTime: Date.now(),
      expired: false
    };

    this.answers.set(questionId, new Map());
    console.log(`[POLL_MANAGER] Created question:`, this.currentQuestion);
    return this.currentQuestion;
  }

  getCurrentQuestion() {
    return this.currentQuestion;
  }

  expireQuestion(questionId) {
    if (this.currentQuestion && this.currentQuestion.id === questionId) {
      this.currentQuestion.expired = true;
      console.log(`[POLL_MANAGER] Question ${questionId} marked as expired`);
    }
  }

  canAskNewQuestion() {
    if (!this.currentQuestion) {
      console.log(`[POLL_MANAGER] Can ask: No current question`);
      return true;
    }

    const students = this.getStudents();
    const answersForCurrent = this.answers.get(this.currentQuestion.id) || new Map();
    
    const noStudents = students.length === 0;
    const allAnswered = answersForCurrent.size >= students.length;
    const expired = this.currentQuestion.expired;
    
    console.log(`[POLL_MANAGER] Can ask check:`, {
      noStudents,
      allAnswered: `${answersForCurrent.size}/${students.length}`,
      expired
    });
    
    return noStudents || allAnswered || expired;
  }

  // Answer management
  submitAnswer(userId, questionId, optionIndex) {
    const answersForQuestion = this.answers.get(questionId);
    if (!answersForQuestion) {
      throw new Error('Question not found');
    }
    
    answersForQuestion.set(userId, optionIndex);
    console.log(`[POLL_MANAGER] Answer submitted: user ${userId} selected option ${optionIndex}`);
    console.log(`[POLL_MANAGER] Total answers for question: ${answersForQuestion.size}`);
  }

  hasUserAnswered(userId, questionId) {
    const answersForQuestion = this.answers.get(questionId);
    if (!answersForQuestion) {
      return false;
    }
    return answersForQuestion.has(userId);
  }

  // Results calculation
  calculateResults(questionId) {
    console.log(`\n========================================`);
    console.log(`[CALCULATE_RESULTS] Starting calculation for question: ${questionId}`);
    
    const answersForQuestion = this.answers.get(questionId) || new Map();
    const question = this.currentQuestion?.id === questionId 
      ? this.currentQuestion 
      : this.questionHistory.find(q => q.id === questionId);
    
    if (!question) {
      console.error(`[CALCULATE_RESULTS] ❌ Question not found:`, questionId);
      return null;
    }

    console.log(`[CALCULATE_RESULTS] Question text: "${question.text}"`);
    console.log(`[CALCULATE_RESULTS] Number of options: ${question.options.length}`);
    console.log(`[CALCULATE_RESULTS] Total answers received: ${answersForQuestion.size}`);

    // Count votes for each option
    const optionCounts = new Array(question.options.length).fill(0);
    const totalAnswers = answersForQuestion.size;

    answersForQuestion.forEach((optionIndex, userId) => {
      console.log(`[CALCULATE_RESULTS] User ${userId} voted for option ${optionIndex}`);
      if (optionIndex >= 0 && optionIndex < optionCounts.length) {
        optionCounts[optionIndex]++;
      }
    });

    console.log(`[CALCULATE_RESULTS] Vote counts per option:`, optionCounts);

    // Build results with percentages
    const results = question.options.map((option, index) => {
      const votes = optionCounts[index];
      const percentage = totalAnswers > 0 
        ? Math.round((votes / totalAnswers) * 100) 
        : 0;
      
      console.log(`[CALCULATE_RESULTS] Option ${index + 1}: "${option.text}" - ${votes} votes (${percentage}%)`);
      
      return {
        text: option.text,
        votes: votes,
        percentage: percentage,
        isCorrect: option.isCorrect || false
      };
    });

    const finalResults = {
      questionId,
      questionText: question.text,
      options: results,
      totalAnswers,
      totalStudents: this.getStudents().length
    };

    console.log(`[CALCULATE_RESULTS] ✅ Final results:`, JSON.stringify(finalResults, null, 2));
    console.log(`========================================\n`);

    return finalResults;
  }

  // History management
  getQuestionHistory() {
    return this.questionHistory.map((q, index) => ({
      questionNumber: index + 1,
      questionId: q.id,
      questionText: q.text,
      results: q.results,
      askedAt: q.askedAt,
      endedAt: q.endedAt
    }));
  }

  // Chat management
  addChatMessage(userId, userName, text) {
    const message = {
      id: uuidv4(),
      userId,
      userName,
      text,
      timestamp: Date.now()
    };

    this.chatMessages.push(message);

    // Keep only last 100 messages
    if (this.chatMessages.length > 100) {
      this.chatMessages.shift();
    }

    console.log(`[POLL_MANAGER] Chat message added: ${userName}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);

    return message;
  }

  getChatMessages() {
    return this.chatMessages;
  }

  // Stats and utilities
  getStats() {
    return {
      totalParticipants: this.participants.size,
      totalStudents: this.getStudents().length,
      totalTeachers: Array.from(this.participants.values())
        .filter(p => p.role === 'teacher').length,
      hasActiveQuestion: !!this.currentQuestion,
      totalQuestions: this.questionHistory.length,
      totalChatMessages: this.chatMessages.length
    };
  }
}

module.exports = PollManager;