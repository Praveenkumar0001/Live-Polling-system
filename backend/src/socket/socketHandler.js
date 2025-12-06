const PollManager = require('../models/pollManager');

const pollManager = new PollManager();

module.exports = (io) => {
  console.log('[SOCKET_HANDLER] Initializing socket handlers');

  io.on('connection', (socket) => {
    console.log(`\n[CONNECTION] New client connected: ${socket.id}`);

    // USER JOIN
    socket.on('user:join', (data) => {
      try {
        console.log(`\n[USER:JOIN] Received from ${socket.id}:`, data);

        const participant = pollManager.addParticipant(socket.id, data.name, data.role);
        
        // Join a common room for broadcasting
        socket.join('poll-room');
        
        // Send join confirmation to the user
        socket.emit('user:joined', {
          userId: participant.id,
          name: participant.name,
          role: participant.role,
          socketId: socket.id
        });

        console.log(`[USER:JOIN] Success - ${participant.role}: ${participant.name}`);

        // Broadcast updated participants list
        const participants = pollManager.getParticipantsList();
        io.to('poll-room').emit('participants:update', participants);

        // Send chat history to new user
        const chatHistory = pollManager.getChatMessages();
        socket.emit('chat:history', chatHistory);

        // If there's an active question, send it to the new student
        if (data.role === 'student') {
          const currentQuestion = pollManager.getCurrentQuestion();
          if (currentQuestion && !currentQuestion.expired) {
            socket.emit('question:new', currentQuestion);
            console.log(`[USER:JOIN] Sent current question to new student`);
          }
        }

      } catch (error) {
        console.error('[USER:JOIN] Error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // QUESTION CREATE
    socket.on('question:create', (data) => {
      try {
        console.log(`\n[QUESTION:CREATE] Received from ${socket.id}`);
        console.log('[QUESTION:CREATE] Data:', data);

        const participant = pollManager.getParticipant(socket.id);
        
        if (!participant) {
          console.error('[QUESTION:CREATE] Participant not found');
          socket.emit('error', { message: 'Participant not found. Please rejoin.' });
          return;
        }

        if (participant.role !== 'teacher') {
          console.error('[QUESTION:CREATE] Only teachers can create questions');
          socket.emit('error', { message: 'Only teachers can create questions' });
          return;
        }

        // Create the question
        const question = pollManager.createQuestion(data);
        console.log('[QUESTION:CREATE] Question created:', question.id);

        // Broadcast to all participants
        io.to('poll-room').emit('question:new', question);
        console.log('[QUESTION:CREATE] Broadcasted to all participants');

        // Set up question timer
        setTimeout(() => {
          console.log(`\n[QUESTION:TIMER] Question ${question.id} expired`);
          pollManager.expireQuestion(question.id);
          
          const results = pollManager.calculateResults(question.id);
          io.to('poll-room').emit('question:expired');
          io.to('poll-room').emit('question:results', results);
        }, question.duration * 1000);

      } catch (error) {
        console.error('[QUESTION:CREATE] Error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // ANSWER SUBMIT
    socket.on('answer:submit', (data) => {
      try {
        console.log(`\n[ANSWER:SUBMIT] Received from ${socket.id}`);
        console.log('[ANSWER:SUBMIT] Data:', data);

        const participant = pollManager.getParticipant(socket.id);
        
        if (!participant) {
          console.error('[ANSWER:SUBMIT] Participant not found');
          socket.emit('error', { message: 'Participant not found' });
          return;
        }

        if (participant.role !== 'student') {
          console.error('[ANSWER:SUBMIT] Only students can submit answers');
          socket.emit('error', { message: 'Only students can submit answers' });
          return;
        }

        const currentQuestion = pollManager.getCurrentQuestion();
        if (!currentQuestion || currentQuestion.id !== data.questionId) {
          console.error('[ANSWER:SUBMIT] Invalid question');
          socket.emit('error', { message: 'Invalid question' });
          return;
        }

        if (currentQuestion.expired) {
          console.error('[ANSWER:SUBMIT] Question has expired');
          socket.emit('error', { message: 'Question has expired' });
          return;
        }

        // Check if already answered
        if (pollManager.hasUserAnswered(participant.id, data.questionId)) {
          console.log('[ANSWER:SUBMIT] User already answered');
          socket.emit('error', { message: 'You have already answered this question' });
          return;
        }

        // Submit the answer
        pollManager.submitAnswer(participant.id, data.questionId, data.optionIndex);
        console.log('[ANSWER:SUBMIT] Answer recorded');

        // Confirm submission to student
        socket.emit('answer:submitted', { questionId: data.questionId });

        // Calculate and broadcast updated results
        const results = pollManager.calculateResults(data.questionId);
        io.to('poll-room').emit('question:results', results);
        
        console.log('[ANSWER:SUBMIT] Results broadcasted');

      } catch (error) {
        console.error('[ANSWER:SUBMIT] Error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // CHECK CAN ASK NEW QUESTION
    socket.on('question:canAsk', () => {
      try {
        const canAsk = pollManager.canAskNewQuestion();
        socket.emit('question:canAskResponse', { canAsk });
      } catch (error) {
        console.error('[QUESTION:CAN_ASK] Error:', error);
      }
    });

    // CHAT MESSAGE
    socket.on('chat:message', (data) => {
      try {
        const participant = pollManager.getParticipant(socket.id);
        
        if (!participant) {
          socket.emit('error', { message: 'Participant not found' });
          return;
        }

        const message = pollManager.addChatMessage(
          participant.id,
          participant.name,
          data.text
        );

        // Broadcast to all participants
        io.to('poll-room').emit('chat:message', message);
        
      } catch (error) {
        console.error('[CHAT:MESSAGE] Error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    // KICK PARTICIPANT
    socket.on('participant:kick', (data) => {
      try {
        console.log(`\n[PARTICIPANT:KICK] Request from ${socket.id} to kick ${data.userId}`);
        
        const requester = pollManager.getParticipant(socket.id);
        
        if (!requester || requester.role !== 'teacher') {
          socket.emit('error', { message: 'Only teachers can kick participants' });
          return;
        }

        const targetParticipant = pollManager.getParticipantByUserId(data.userId);
        
        if (!targetParticipant) {
          console.error('[PARTICIPANT:KICK] Target not found');
          return;
        }

        if (targetParticipant.role === 'teacher') {
          socket.emit('error', { message: 'Cannot kick teachers' });
          return;
        }

        // Find the socket and kick them
        const targetSocket = io.sockets.sockets.get(targetParticipant.socketId);
        if (targetSocket) {
          targetSocket.emit('user:kicked');
          targetSocket.disconnect(true);
        }

        pollManager.removeParticipant(targetParticipant.socketId);
        
        // Broadcast updated participants list
        const participants = pollManager.getParticipantsList();
        io.to('poll-room').emit('participants:update', participants);
        
        console.log('[PARTICIPANT:KICK] Success');
        
      } catch (error) {
        console.error('[PARTICIPANT:KICK] Error:', error);
      }
    });

    // GET HISTORY
    socket.on('history:get', () => {
      try {
        const participant = pollManager.getParticipant(socket.id);
        
        if (!participant || participant.role !== 'teacher') {
          socket.emit('error', { message: 'Only teachers can view history' });
          return;
        }

        const history = pollManager.getQuestionHistory();
        socket.emit('history:data', history);
        
      } catch (error) {
        console.error('[HISTORY:GET] Error:', error);
      }
    });

    // DISCONNECT
    socket.on('disconnect', (reason) => {
      console.log(`\n[DISCONNECT] Client ${socket.id} disconnected: ${reason}`);
      
      const participant = pollManager.getParticipant(socket.id);
      if (participant) {
        console.log(`[DISCONNECT] Removing ${participant.role}: ${participant.name}`);
        pollManager.removeParticipant(socket.id);
        
        // Broadcast updated participants list
        const participants = pollManager.getParticipantsList();
        io.to('poll-room').emit('participants:update', participants);
      }
    });
  });

  // Log stats every 30 seconds
  setInterval(() => {
    const stats = pollManager.getStats();
    console.log('\n[STATS]', stats);
  }, 30000);
};